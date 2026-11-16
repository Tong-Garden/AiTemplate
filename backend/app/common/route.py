import logging
from typing import Any, Callable, Coroutine

from fastapi import Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.common.responses import error_item, error_response, errors_response
from app.common.schemas import ErrorItem

logger = logging.getLogger(__name__)

_SOURCES = {"body", "query", "path", "header", "cookie"}


def _field_of(loc: tuple[Any, ...]) -> str | None:
    """Return the offending field name from a Pydantic error location, if it names one."""
    names = [part for part in loc if isinstance(part, str) and part not in _SOURCES]
    return names[-1] if names else None


def validation_errors(exc: RequestValidationError) -> list[ErrorItem]:
    """Convert Pydantic request errors into envelope error objects."""
    return [
        error_item(422, "validation-error", err["msg"], _field_of(tuple(err["loc"])))
        for err in exc.errors()
    ]


class EnvelopeRoute(APIRoute):
    """Route class that reports validation failures and unexpected errors in the envelope.

    Scoped to the routers that opt in, so existing features keep their current responses.
    """

    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        """Wrap the default handler and translate validation errors to the envelope."""
        original = super().get_route_handler()

        async def handler(request: Request) -> Response:
            try:
                return await original(request)
            except RequestValidationError as exc:
                return errors_response(422, validation_errors(exc))
            except StarletteHTTPException:
                raise
            except Exception:
                logger.exception("Unhandled error on %s", request.url.path)
                return error_response(500, "server-error", "An unexpected error occurred.")

        return handler
