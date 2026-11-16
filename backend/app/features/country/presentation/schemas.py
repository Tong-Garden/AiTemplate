from typing import Any

from pydantic import BaseModel, Field

from app.common.schemas import ErrorItem, PaginationMeta


class CreateCountrySchema(BaseModel):
    """Request body for creating a country."""

    name: str = Field(..., min_length=2, max_length=100)
    iso_code: str = Field(..., min_length=2, max_length=2)
    phone_code: str = Field(..., min_length=2, max_length=5)


class UpdateCountrySchema(BaseModel):
    """Request body for updating a country; omitted fields are left unchanged."""

    name: str | None = Field(None, min_length=2, max_length=100)
    iso_code: str | None = Field(None, min_length=2, max_length=2)
    phone_code: str | None = Field(None, min_length=2, max_length=5)


class CountryResponse(BaseModel):
    """A country as returned to clients."""

    id: str
    name: str
    iso_code: str
    phone_code: str


class CountryListResponse(BaseModel):
    """Envelope for the paginated country list."""

    status: str = "success"
    data: list[CountryResponse]
    errors: list[ErrorItem] = Field(default_factory=list)
    meta: PaginationMeta


class CountryDetailResponse(BaseModel):
    """Envelope for a single country; `data` is null after a delete."""

    status: str = "success"
    data: CountryResponse | None = None
    errors: list[ErrorItem] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)
