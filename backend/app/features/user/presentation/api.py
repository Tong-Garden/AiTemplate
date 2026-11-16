import os
import tempfile

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse

from app.common.responses import build_meta, error_response
from app.common.route import EnvelopeRoute
from app.features.user.application import UserService
from app.features.user.domain.exceptions import (
    DuplicateEmailError,
    UserNotFoundError,
    UserValidationError,
)
from app.features.user.presentation.dependencies import get_user_service
from app.features.user.presentation.excel_parser import ExcelParser
from app.features.user.presentation.mapper import UserMapper
from app.features.user.presentation.schemas import (
    CreateUserSchema,
    UpdateUserSchema,
    UploadCountData,
    UploadUsersResponse,
    UserDetailResponse,
    UserListResponse,
)

router = APIRouter(prefix="/users", tags=["users"], route_class=EnvelopeRoute)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024

DOMAIN_ERRORS = (UserNotFoundError, DuplicateEmailError, UserValidationError)


def _domain_error(exc: Exception) -> JSONResponse:
    """Translate a domain exception into its envelope error response."""
    if isinstance(exc, UserNotFoundError):
        return error_response(404, "not-found", str(exc))
    if isinstance(exc, DuplicateEmailError):
        return error_response(409, "conflict", str(exc))
    if isinstance(exc, UserValidationError):
        return error_response(422, "validation-error", exc.detail, exc.field)
    return error_response(500, "server-error", "Unexpected error.")


@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserDetailResponse)
async def create_user(
    schema: CreateUserSchema,
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse | JSONResponse:
    """Create a user."""
    try:
        user = await service.create(**schema.model_dump())
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return UserDetailResponse(data=UserMapper.to_response(user))


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    service: UserService = Depends(get_user_service),
) -> UserListResponse:
    """Return one page of users with pagination meta."""
    users, total = await service.list(page, limit)
    return UserListResponse(
        data=UserMapper.to_response_list(users),
        meta=build_meta(page, limit, total),
    )


@router.post("/upload", response_model=UploadUsersResponse)
async def upload_users(
    file: UploadFile = File(...),
    service: UserService = Depends(get_user_service),
) -> UploadUsersResponse | JSONResponse:
    """Import users from an Excel file, skipping emails that already exist."""
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xls")):
        return error_response(400, "bad-request", "File must be an Excel file (.xlsx or .xls)")

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        return error_response(400, "bad-request", "File must be 5 MB or smaller")

    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    try:
        users = await run_in_threadpool(ExcelParser.parse_users, tmp_path)
    except ValueError as exc:
        return error_response(400, "bad-request", str(exc))
    finally:
        os.unlink(tmp_path)

    count = await service.upload_from_excel(users)
    return UploadUsersResponse(data=UploadCountData(count=count))


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: str,
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse | JSONResponse:
    """Return one user."""
    try:
        user = await service.get_by_id(user_id)
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return UserDetailResponse(data=UserMapper.to_response(user))


@router.put("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: str,
    schema: UpdateUserSchema,
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse | JSONResponse:
    """Update the supplied fields of a user."""
    try:
        user = await service.update(user_id, **schema.model_dump())
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return UserDetailResponse(data=UserMapper.to_response(user))


@router.delete("/{user_id}", response_model=UserDetailResponse)
async def delete_user(
    user_id: str,
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse | JSONResponse:
    """Delete a user."""
    try:
        await service.delete(user_id)
    except DOMAIN_ERRORS as exc:
        return _domain_error(exc)
    return UserDetailResponse()
