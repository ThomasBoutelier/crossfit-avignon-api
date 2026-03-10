import logging
import math
from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user
from app.core.rate_limit import rate_limiter
from app.db.session import get_db
from app.models.lead import Lead, LeadEvent
from app.models.user import User
from app.schemas.lead import (
    LeadListResponse,
    LeadPublic,
    LeadUpdate,
    LeadWaitlistCreate,
    LeadWithEvents,
)


logger = logging.getLogger(__name__)

router = APIRouter()


# ── Route PUBLIQUE : utilisée par le site web ──────────────────────────────

@router.post(
    "/waitlist",
    response_model=LeadPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un lead de liste d'attente (public)",
)
async def create_waitlist_lead(
    payload: LeadWaitlistCreate,
    request: Request,
    db: Session = Depends(get_db),
    _: None = Depends(rate_limiter),
) -> LeadPublic:
    """Reçoit une soumission de formulaire de la landing page et stocke un lead."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    lead = Lead(
        prenom=payload.prenom.strip(),
        nom=payload.nom.strip(),
        email=payload.email.lower(),
        telephone=payload.telephone,
        experience=payload.experience,
        message=payload.message,
        source=payload.source,
        utm_source=payload.utm_source,
        utm_medium=payload.utm_medium,
        utm_campaign=payload.utm_campaign,
        utm_content=payload.utm_content,
        utm_term=payload.utm_term,
        referrer=payload.referrer,
        landing_url=payload.landing_url,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    db.add(lead)

    event = LeadEvent(
        lead=lead,
        event_type="created",
        event_note="Lead créé via le formulaire de pré-ouverture",
    )
    db.add(event)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        logger.warning("Duplicate lead email attempted: %s", payload.email)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un lead avec cet email existe déjà.",
        ) from exc
    except Exception as exc:  # pragma: no cover
        db.rollback()
        logger.exception("Unexpected error while creating lead")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du lead.",
        ) from exc

    db.refresh(lead)
    return lead


# ── Routes PROTÉGÉES : CRM interne ────────────────────────────────────────

@router.get(
    "/stats",
    summary="Statistiques dashboard CRM",
)
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Indicateurs pour le dashboard CRM."""
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    today = date.today()

    total = db.query(func.count(Lead.id)).scalar()
    new_today = (
        db.query(func.count(Lead.id))
        .filter(Lead.created_at >= today_start)
        .scalar()
    )
    converted = (
        db.query(func.count(Lead.id)).filter(Lead.status == "converted").scalar()
    )
    to_call_today = (
        db.query(func.count(Lead.id))
        .filter(Lead.status.notin_(["converted", "lost"]))
        .filter(
            or_(
                Lead.status == "to_call",
                Lead.next_action_date <= today,
            )
        )
        .scalar()
    )

    by_status = db.query(Lead.status, func.count(Lead.id)).group_by(Lead.status).all()
    by_source = (
        db.query(Lead.source, func.count(Lead.id))
        .filter(Lead.source.isnot(None))
        .group_by(Lead.source)
        .all()
    )

    return {
        "total": total,
        "new_today": new_today,
        "converted": converted,
        "to_call_today": to_call_today,
        "by_status": {s: c for s, c in by_status},
        "by_source": {s: c for s, c in by_source},
    }


@router.get(
    "/to-call",
    response_model=LeadListResponse,
    summary="Leads à rappeler aujourd'hui",
)
def leads_to_call(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    _: User = Depends(get_current_user),
) -> LeadListResponse:
    """Leads avec statut 'to_call' ou dont next_action_date <= aujourd'hui, non convertis/perdus."""
    today = date.today()
    q = (
        db.query(Lead)
        .filter(Lead.status.notin_(["converted", "lost"]))
        .filter(
            or_(
                Lead.status == "to_call",
                Lead.next_action_date <= today,
            )
        )
        .order_by(Lead.next_action_date.asc().nulls_last(), Lead.created_at.desc())
    )

    total = q.count()
    offset = (page - 1) * page_size
    items = q.offset(offset).limit(page_size).all()
    pages = math.ceil(total / page_size) if total > 0 else 1

    return LeadListResponse(
        items=items, total=total, page=page, page_size=page_size, pages=pages
    )


@router.get(
    "",
    response_model=LeadListResponse,
    summary="Lister les leads (CRM)",
)
def list_leads(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    _: User = Depends(get_current_user),
) -> LeadListResponse:
    """Liste paginée des leads avec filtres et tri."""
    q = db.query(Lead)

    if status:
        q = q.filter(Lead.status == status)
    if source:
        q = q.filter(Lead.source == source)
    if search:
        term = f"%{search}%"
        q = q.filter(
            or_(
                Lead.prenom.ilike(term),
                Lead.nom.ilike(term),
                Lead.email.ilike(term),
                Lead.telephone.ilike(term),
            )
        )

    valid_sort_columns = {
        "created_at": Lead.created_at,
        "updated_at": Lead.updated_at,
        "nom": Lead.nom,
        "prenom": Lead.prenom,
        "status": Lead.status,
        "next_action_date": Lead.next_action_date,
    }
    sort_col = valid_sort_columns.get(sort_by, Lead.created_at)
    q = q.order_by(sort_col.asc() if sort_order == "asc" else sort_col.desc())

    total = q.count()
    offset = (page - 1) * page_size
    items = q.offset(offset).limit(page_size).all()
    pages = math.ceil(total / page_size) if total > 0 else 1

    return LeadListResponse(
        items=items, total=total, page=page, page_size=page_size, pages=pages
    )


@router.get(
    "/{lead_id}",
    response_model=LeadWithEvents,
    summary="Détail d'un lead",
)
def get_lead(
    lead_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> LeadWithEvents:
    """Retourne un lead avec son historique d'événements."""
    lead = (
        db.query(Lead)
        .options(selectinload(Lead.events))
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead introuvable.")
    return lead


@router.patch(
    "/{lead_id}",
    response_model=LeadWithEvents,
    summary="Mettre à jour un lead",
)
def update_lead(
    lead_id: UUID,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> LeadWithEvents:
    """Met à jour statut, notes et/ou date de prochaine action."""
    lead = (
        db.query(Lead)
        .options(selectinload(Lead.events))
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead introuvable.")

    update_data = payload.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] != lead.status:
        old_status = lead.status
        lead.status = update_data["status"]
        db.add(
            LeadEvent(
                lead_id=lead.id,
                event_type="status_changed",
                event_note=f"Statut changé : {old_status} → {update_data['status']}",
            )
        )

    if "notes" in update_data and update_data["notes"] != lead.notes:
        lead.notes = update_data["notes"]
        db.add(
            LeadEvent(
                lead_id=lead.id,
                event_type="note_added",
                event_note=update_data["notes"],
            )
        )

    if "next_action_date" in update_data:
        lead.next_action_date = update_data["next_action_date"]

    if "lost_reason" in update_data:
        lead.lost_reason = update_data["lost_reason"]

    db.commit()
    db.refresh(lead)
    return lead
