from pydantic import BaseModel


class ErrorItem(BaseModel):
    """One entry of the envelope's `errors` array."""

    type: str
    title: str
    status: int
    detail: str
    field: str | None = None


class PaginationMeta(BaseModel):
    """Pagination block returned in `meta` by every list endpoint."""

    page: int
    limit: int
    total: int
    totalPages: int
    hasNextPage: bool
    hasPreviousPage: bool
