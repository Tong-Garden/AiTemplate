from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse

from app.common.responses import build_meta, error_response
from app.common.route import EnvelopeRoute
from app.features.company.application import CompanyService
from app.features.company.domain import (
    CompanyNotFoundError,
    CompanyValidationError,
    DuplicateCompanyNameError,
)
from app.features.company.presentation.dependencies import get_company_service
from app.features.company.presentation.mapper import CompanyMapper
from app.features.company.presentation.schemas import (
    CompanyDetailResponse,
    CompanyListResponse,
    CreateCompanySchema,
    UpdateCompanySchema,
)

router = APIRouter(prefix="/companies", tags=["companies"], route_class=EnvelopeRoute)

DOMAIN_ERRORS = (CompanyNotFoundError, DuplicateCompanyNameError, CompanyValidationError)


def _domain_error(exc: Exception) -> JSONResponse:
    """Translate a domain exception into its envelope error response."""
    if isinstance(exc, CompanyNotFoundError):
        return error_response(404, "not-found", str(exc))
    if isinstance(exc, DuplicateCompanyNameError):
        return error_response(409, "conflict", str(exc))
    if isinstance(exc, CompanyValidationError):
        return error_response(422, "validation-error", exc.detail, exc.field)
    return error_response(500, "server-error", "Unexpected error.")


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CompanyDetailResponse)
async def create_company(
    schema: CreateCompanySchema,
    service: CompanyService = Depends(get_company_service),
) -> CompanyDetailResponse | JSONResponse:
    """Create a company."""
    try:
        company = await service.create(**schema.model_dump())
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return CompanyDetailResponse(data=CompanyMapper.to_response(company))


@router.get("", response_model=CompanyListResponse)
async def list_companies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    service: CompanyService = Depends(get_company_service),
) -> CompanyListResponse:
    """Return one page of companies with pagination meta."""
    companies, total = await service.list(page, limit)
    return CompanyListResponse(
        data=CompanyMapper.to_response_list(companies),
        meta=build_meta(page, limit, total),
    )


@router.get("/{company_id}", response_model=CompanyDetailResponse)
async def get_company(
    company_id: str,
    service: CompanyService = Depends(get_company_service),
) -> CompanyDetailResponse | JSONResponse:
    """Return one company."""
    try:
        company = await service.get_by_id(company_id)
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return CompanyDetailResponse(data=CompanyMapper.to_response(company))


@router.put("/{company_id}", response_model=CompanyDetailResponse)
async def update_company(
    company_id: str,
    schema: UpdateCompanySchema,
    service: CompanyService = Depends(get_company_service),
) -> CompanyDetailResponse | JSONResponse:
    """Update the supplied fields of a company."""
    try:
        company = await service.update(company_id, **schema.model_dump())
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return CompanyDetailResponse(data=CompanyMapper.to_response(company))


@router.delete("/{company_id}", response_model=CompanyDetailResponse)
async def delete_company(
    company_id: str,
    service: CompanyService = Depends(get_company_service),
) -> CompanyDetailResponse | JSONResponse:
    """Delete a company."""
    try:
        await service.delete(company_id)
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return CompanyDetailResponse()
