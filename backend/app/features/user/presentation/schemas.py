from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.common.schemas import ErrorItem, PaginationMeta


class CreateUserSchema(BaseModel):
    """Request body for creating a user."""

    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=20)
    is_active: bool = Field(default=True)


class UpdateUserSchema(BaseModel):
    """Request body for updating a user; omitted fields are left unchanged."""

    name: str | None = Field(None, min_length=2, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(None, min_length=5, max_length=20)
    is_active: bool | None = None


class UserResponse(BaseModel):
    """A user as returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    phone: str
    is_active: bool


class UploadCountData(BaseModel):
    """Payload of a successful upload."""

    count: int


class UserListResponse(BaseModel):
    """Envelope for the paginated user list."""

    status: str = "success"
    data: list[UserResponse]
    errors: list[ErrorItem] = Field(default_factory=list)
    meta: PaginationMeta


class UserDetailResponse(BaseModel):
    """Envelope for a single user; `data` is null after a delete."""

    status: str = "success"
    data: UserResponse | None = None
    errors: list[ErrorItem] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)


class UploadUsersResponse(BaseModel):
    """Envelope for the upload result."""

    status: str = "success"
    data: UploadCountData
    errors: list[ErrorItem] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)
