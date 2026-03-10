from datetime import date, datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


LeadStatus = Literal[
    "new",
    "to_call",
    "contacted",
    "trial_scheduled",
    "trial_done",
    "converted",
    "lost",
]

SportExperience = Literal["debutant", "sportif", "confirme", "crossfit"]


class LeadBase(BaseModel):
    prenom: str = Field(..., min_length=1, max_length=255)
    nom: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    telephone: Optional[str] = Field(default=None, max_length=50)
    experience: Optional[SportExperience] = None
    message: Optional[str] = None

    source: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None
    referrer: Optional[str] = None
    landing_url: Optional[str] = None


class LeadWaitlistCreate(LeadBase):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    lost_reason: Optional[str] = None
    notes: Optional[str] = None
    next_action_date: Optional[date] = None


class LeadInDBBase(LeadBase):
    id: UUID
    status: LeadStatus
    lost_reason: Optional[str] = None
    notes: Optional[str] = None
    next_action_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeadPublic(LeadInDBBase):
    pass


class LeadEventPublic(BaseModel):
    id: UUID
    event_type: str
    event_note: Optional[str] = None
    event_at: datetime

    class Config:
        from_attributes = True


class LeadWithEvents(LeadInDBBase):
    events: List[LeadEventPublic] = []


class LeadListResponse(BaseModel):
    items: List[LeadPublic]
    total: int
    page: int
    page_size: int
    pages: int
