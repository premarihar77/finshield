from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    description: str = Field(..., min_length=10, max_length=2000)
    scammer_contact: str | None = None
    platform: str = Field(..., min_length=2, max_length=80)
    amount_lost: float = Field(default=0, ge=0)
