import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from ..application import UserService
from ..domain.exceptions import DuplicateEmailError, InvalidEmailError, UserNotFoundError
from .dependencies import get_user_service
from .excel_parser import ExcelParser
from .mapper import UserMapper
from .schemas import (
    CountResponse,
    CreateUserSchema,
    UpdateUserSchema,
    UserDetailResponse,
    UserListResponse,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserDetailResponse)
async def create_user(
    schema: CreateUserSchema,
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse:
    try:
        user = await service.create(
            name=schema.name,
            email=schema.email,
            phone=schema.phone,
            is_active=schema.is_active,
        )
        return UserDetailResponse(
            status="success",
            data=UserMapper.to_response(user),
            message="User created successfully",
        )
    except (InvalidEmailError, DuplicateEmailError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=UserListResponse)
async def list_users(
    service: UserService = Depends(get_user_service),
) -> UserListResponse:
    users = await service.list_all()
    return UserListResponse(
        status="success",
        data=UserMapper.to_response_list(users),
    )


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: str,
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse:
    try:
        user = await service.get_by_id(user_id)
        return UserDetailResponse(
            status="success",
            data=UserMapper.to_response(user),
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: str,
    schema: UpdateUserSchema,
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse:
    try:
        user = await service.update(
            user_id=user_id,
            name=schema.name,
            email=schema.email,
            phone=schema.phone,
            is_active=schema.is_active,
        )
        return UserDetailResponse(
            status="success",
            data=UserMapper.to_response(user),
            message="User updated successfully",
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except (InvalidEmailError, DuplicateEmailError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}", status_code=status.HTTP_200_OK, response_model=UserDetailResponse)
async def delete_user(
    user_id: str,
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse:
    try:
        await service.delete(user_id)
        return UserDetailResponse(status="success", data=None, message="User deleted successfully")
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/upload", status_code=status.HTTP_200_OK, response_model=CountResponse)
async def upload_users(
    file: UploadFile = File(...),
    service: UserService = Depends(get_user_service),
) -> CountResponse:
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="File must be an Excel file (.xlsx or .xls)",
        )

    try:
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        users = ExcelParser.parse_users(tmp_path)
        count = await service.upload_from_excel(users)

        os.unlink(tmp_path)

        return CountResponse(
            status="success", data={"count": count}, message=f"{count} users imported successfully"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
