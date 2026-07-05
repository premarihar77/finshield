from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    message: str = Field(..., min_length=3, max_length=1000)
    rating: int = Field(..., ge=1, le=5)
