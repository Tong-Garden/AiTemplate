from typing import Any

from pydantic import BaseModel, Field

from app.common.schemas import ErrorItem, PaginationMeta


class CreateCompanySchema(BaseModel):
    """Request body for creating a company."""

    name: str = Field(..., min_length=2, max_length=255)
    address: str = Field(..., min_length=5, max_length=500)
    phone_number: str = Field(..., min_length=7, max_length=20)
    timezone: str = Field(..., min_length=1, max_length=64)


class UpdateCompanySchema(BaseModel):
    """Request body for updating a company; omitted fields are left unchanged."""

    name: str | None = Field(None, min_length=2, max_length=255)
    address: str | None = Field(None, min_length=5, max_length=500)
    phone_number: str | None = Field(None, min_length=7, max_length=20)
    timezone: str | None = Field(None, min_length=1, max_length=64)


class CompanyResponse(BaseModel):
    """A company as returned to clients."""

    id: str
    name: str
    address: str
    phone_number: str
    timezone: str


class CompanyListResponse(BaseModel):
    """Envelope for the paginated company list."""

    status: str = "success"
    data: list[CompanyResponse]
    errors: list[ErrorItem] = Field(default_factory=list)
    meta: PaginationMeta


class CompanyDetailResponse(BaseModel):
    """Envelope for a single company; `data` is null after a delete."""

    status: str = "success"
    data: CompanyResponse | None = None
    errors: list[ErrorItem] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)
