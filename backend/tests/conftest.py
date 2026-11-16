from typing import Any

from httpx import Response

ENVELOPE_KEYS = {"status", "data", "errors", "meta"}
ERROR_KEYS = {"type", "title", "status", "detail", "field"}
META_KEYS = {"page", "limit", "total", "totalPages", "hasNextPage", "hasPreviousPage"}


def assert_envelope(response: Response, http_status: int) -> dict[str, Any]:
    """Assert the standard response envelope and return the parsed body.

    Error responses must have null `data` and fully populated error objects whose status
    matches the HTTP status header.
    """
    assert response.status_code == http_status
    body: dict[str, Any] = response.json()
    assert set(body) == ENVELOPE_KEYS
    if body["status"] == "error":
        assert body["data"] is None
        assert body["errors"]
        for error in body["errors"]:
            assert set(error) == ERROR_KEYS
            assert error["status"] == http_status
    else:
        assert body["errors"] == []
    return body


def assert_list_meta(body: dict[str, Any]) -> dict[str, Any]:
    """Assert the pagination meta block is complete and return it."""
    assert set(body["meta"]) == META_KEYS
    return body["meta"]  # type: ignore[no-any-return]
