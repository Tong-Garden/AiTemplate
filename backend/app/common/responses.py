import math
from typing import Any

from fastapi.responses import JSONResponse

from app.common.schemas import ErrorItem, PaginationMeta

ERROR_TITLES: dict[str, str] = {
    "validation-error": "Validation Error",
    "not-found": "Resource Not Found",
    "conflict": "Conflict",
    "bad-request": "Bad Request",
    "unauthorized": "Unauthorized",
    "forbidden": "Forbidden",
    "server-error": "Server Error",
}


def build_meta(page: int, limit: int, total: int) -> PaginationMeta:
    """Build the pagination `meta` block.

    Args:
        page: Current 1-based page.
        limit: Page size.
        total: Total number of matching records.

    Returns:
        The populated pagination meta.
    """
    total_pages = math.ceil(total / limit) if total else 0
    return PaginationMeta(
        page=page,
        limit=limit,
        total=total,
        totalPages=total_pages,
        hasNextPage=page < total_pages,
        hasPreviousPage=page > 1,
    )


def error_item(
    status_code: int, error_type: str, detail: str, field: str | None = None
) -> ErrorItem:
    """Build one standardised error object."""
    return ErrorItem(
        type=error_type,
        title=ERROR_TITLES[error_type],
        status=status_code,
        detail=detail,
        field=field,
    )


def errors_response(status_code: int, errors: list[ErrorItem]) -> JSONResponse:
    """Wrap error objects in the standard envelope.

    The envelope never carries `data` on failure, so clients can rely on `data` being null.
    """
    content: dict[str, Any] = {
        "status": "error",
        "data": None,
        "errors": [item.model_dump() for item in errors],
        "meta": {},
    }
    return JSONResponse(status_code=status_code, content=content)


def error_response(
    status_code: int, error_type: str, detail: str, field: str | None = None
) -> JSONResponse:
    """Return a single-error envelope with the matching HTTP status header."""
    return errors_response(status_code, [error_item(status_code, error_type, detail, field)])
