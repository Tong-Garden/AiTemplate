from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, EmailStr, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Generic API response wrapper."""

    status: str
    data: Optional[T] = None
    message: Optional[str] = None


class CreateUserSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=20)
    is_active: bool = Field(default=True)


class UpdateUserSchema(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(None, min_length=5, max_length=20)
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    is_active: bool

    class Config:
        from_attributes = True


class UserListResponse(ApiResponse[list[UserResponse]]):
    """Response for list of users."""

    pass


class UserDetailResponse(ApiResponse[UserResponse]):
    """Response for single user."""

    pass


class CountResponse(ApiResponse[dict]):
    """Response for count operations."""

    pass
