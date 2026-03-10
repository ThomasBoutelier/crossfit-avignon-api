import uuid
from datetime import date, datetime

from sqlalchemy import (
    UUID,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class LeadStatusEnum(str):
    NEW = "new"
    TO_CALL = "to_call"
    CONTACTED = "contacted"
    TRIAL_SCHEDULED = "trial_scheduled"
    TRIAL_DONE = "trial_done"
    CONVERTED = "converted"
    LOST = "lost"


class SportExperienceEnum(str):
    DEBUTANT = "debutant"
    SPORTIF = "sportif"
    CONFIRME = "confirme"
    CROSSFIT = "crossfit"


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    prenom: Mapped[str] = mapped_column(String, nullable=False)
    nom: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    telephone: Mapped[str | None] = mapped_column(String, nullable=True)
    experience: Mapped[str | None] = mapped_column(
        Enum(
            SportExperienceEnum.DEBUTANT,
            SportExperienceEnum.SPORTIF,
            SportExperienceEnum.CONFIRME,
            SportExperienceEnum.CROSSFIT,
            name="sport_experience",
        ),
        nullable=True,
    )
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    source: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_source: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_medium: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_content: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_term: Mapped[str | None] = mapped_column(String, nullable=True)
    referrer: Mapped[str | None] = mapped_column(String, nullable=True)
    landing_url: Mapped[str | None] = mapped_column(String, nullable=True)

    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(
        Enum(
            LeadStatusEnum.NEW,
            LeadStatusEnum.TO_CALL,
            LeadStatusEnum.CONTACTED,
            LeadStatusEnum.TRIAL_SCHEDULED,
            LeadStatusEnum.TRIAL_DONE,
            LeadStatusEnum.CONVERTED,
            LeadStatusEnum.LOST,
            name="lead_status",
        ),
        nullable=False,
        default=LeadStatusEnum.NEW,
        server_default=LeadStatusEnum.NEW,
    )
    lost_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_action_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    events: Mapped[list["LeadEvent"]] = relationship(
        "LeadEvent", back_populates="lead", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_leads_status", "status"),
        Index("idx_leads_created_at", "created_at"),
        Index("idx_leads_utm_source", "utm_source"),
        Index("idx_leads_utm_campaign", "utm_campaign"),
        Index("idx_leads_next_action_date", "next_action_date"),
        CheckConstraint("email <> ''", name="ck_leads_email_not_empty"),
    )


class LeadEvent(Base):
    __tablename__ = "lead_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
    )

    event_type: Mapped[str] = mapped_column(String, nullable=False)
    event_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    created_by: Mapped[str | None] = mapped_column(String, nullable=True)

    lead: Mapped[Lead] = relationship("Lead", back_populates="events")

    __table_args__ = (
        Index("idx_lead_events_lead_id", "lead_id"),
        Index("idx_lead_events_event_at", "event_at"),
    )
