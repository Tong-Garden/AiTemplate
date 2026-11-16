from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse

from app.common.responses import build_meta, error_response
from app.common.route import EnvelopeRoute
from app.features.country.application import CountryService
from app.features.country.domain import (
    CountryNotFoundError,
    CountryValidationError,
    DuplicateCountryNameError,
    DuplicateIsoCodeError,
)
from app.features.country.presentation.dependencies import get_country_service
from app.features.country.presentation.mapper import CountryMapper
from app.features.country.presentation.schemas import (
    CountryDetailResponse,
    CountryListResponse,
    CreateCountrySchema,
    UpdateCountrySchema,
)

router = APIRouter(prefix="/countries", tags=["countries"], route_class=EnvelopeRoute)

DOMAIN_ERRORS = (
    CountryNotFoundError,
    DuplicateCountryNameError,
    DuplicateIsoCodeError,
    CountryValidationError,
)


def _domain_error(exc: Exception) -> JSONResponse:
    """Translate a domain exception into its envelope error response."""
    if isinstance(exc, CountryNotFoundError):
        return error_response(404, "not-found", str(exc))
    if isinstance(exc, (DuplicateCountryNameError, DuplicateIsoCodeError)):
        return error_response(409, "conflict", str(exc))
    if isinstance(exc, CountryValidationError):
        return error_response(422, "validation-error", exc.detail, exc.field)
    return error_response(500, "server-error", "Unexpected error.")


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CountryDetailResponse)
async def create_country(
    schema: CreateCountrySchema,
    service: CountryService = Depends(get_country_service),
) -> CountryDetailResponse | JSONResponse:
    """Create a country."""
    try:
        country = await service.create(**schema.model_dump())
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return CountryDetailResponse(data=CountryMapper.to_response(country))


@router.get("", response_model=CountryListResponse)
async def list_countries(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    service: CountryService = Depends(get_country_service),
) -> CountryListResponse:
    """Return one page of countries with pagination meta."""
    countries, total = await service.list(page, limit)
    return CountryListResponse(
        data=CountryMapper.to_response_list(countries),
        meta=build_meta(page, limit, total),
    )


@router.get("/{country_id}", response_model=CountryDetailResponse)
async def get_country(
    country_id: str,
    service: CountryService = Depends(get_country_service),
) -> CountryDetailResponse | JSONResponse:
    """Return one country."""
    try:
        country = await service.get_by_id(country_id)
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return CountryDetailResponse(data=CountryMapper.to_response(country))


@router.put("/{country_id}", response_model=CountryDetailResponse)
async def update_country(
    country_id: str,
    schema: UpdateCountrySchema,
    service: CountryService = Depends(get_country_service),
) -> CountryDetailResponse | JSONResponse:
    """Update the supplied fields of a country."""
    try:
        country = await service.update(country_id, **schema.model_dump())
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return CountryDetailResponse(data=CountryMapper.to_response(country))


@router.delete("/{country_id}", response_model=CountryDetailResponse)
async def delete_country(
    country_id: str,
    service: CountryService = Depends(get_country_service),
) -> CountryDetailResponse | JSONResponse:
    """Delete a country."""
    try:
        await service.delete(country_id)
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return CountryDetailResponse()
