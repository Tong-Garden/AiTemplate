from fastapi.testclient import TestClient

from tests.conftest import assert_envelope, assert_list_meta

VALID: dict[str, str] = {
    "name": "Delta Corp",
    "address": "4 Fourth Avenue",
    "phone_number": "+1 (555) 010-0100",
    "timezone": "America/New_York",
}


def test_create_returns_201_and_envelope(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/companies", json=VALID), 201)
    assert body["data"]["name"] == "Delta Corp"
    assert body["data"]["id"]


def test_create_trims_values(client: TestClient) -> None:
    payload = {**VALID, "name": "  Delta Corp  "}
    body = assert_envelope(client.post("/v1/companies", json=payload), 201)
    assert body["data"]["name"] == "Delta Corp"


def test_create_invalid_timezone_is_422_with_field(client: TestClient) -> None:
    body = assert_envelope(
        client.post("/v1/companies", json={**VALID, "timezone": "Mars/Base"}), 422
    )
    assert body["errors"][0]["type"] == "validation-error"
    assert body["errors"][0]["field"] == "timezone"


def test_create_invalid_phone_is_422_with_field(client: TestClient) -> None:
    body = assert_envelope(
        client.post("/v1/companies", json={**VALID, "phone_number": "abc-defg-hij"}), 422
    )
    assert body["errors"][0]["field"] == "phone_number"


def test_create_missing_field_is_enveloped_422(client: TestClient) -> None:
    payload = {k: v for k, v in VALID.items() if k != "address"}
    body = assert_envelope(client.post("/v1/companies", json=payload), 422)
    assert body["errors"][0]["field"] == "address"


def test_create_whitespace_name_is_422(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/companies", json={**VALID, "name": "      "}), 422)
    assert body["errors"][0]["field"] == "name"


def test_create_duplicate_name_ignoring_case_is_409(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/companies", json={**VALID, "name": "ALPHA ltd"}), 409)
    assert body["errors"][0]["type"] == "conflict"


def test_list_is_paginated_with_meta(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/companies?page=2&limit=2"), 200)
    meta = assert_list_meta(body)
    assert len(body["data"]) == 1
    assert meta == {
        "page": 2,
        "limit": 2,
        "total": 3,
        "totalPages": 2,
        "hasNextPage": False,
        "hasPreviousPage": True,
    }


def test_list_defaults_to_page_one_limit_twenty(client: TestClient) -> None:
    meta = assert_list_meta(assert_envelope(client.get("/v1/companies"), 200))
    assert (meta["page"], meta["limit"]) == (1, 20)


def test_list_rejects_limit_over_100(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/companies?limit=101"), 422)
    assert body["errors"][0]["field"] == "limit"


def test_get_by_id(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/companies/id-2"), 200)
    assert body["data"]["name"] == "Beta Ltd"
    assert body["meta"] == {}


def test_get_missing_is_404(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/companies/nope"), 404)
    assert body["errors"][0]["type"] == "not-found"


def test_update_changes_only_supplied_fields(client: TestClient) -> None:
    body = assert_envelope(client.put("/v1/companies/id-1", json={"timezone": "Asia/Tokyo"}), 200)
    assert body["data"]["timezone"] == "Asia/Tokyo"
    assert body["data"]["name"] == "Alpha Ltd"


def test_update_keeping_own_name_is_allowed(client: TestClient) -> None:
    assert_envelope(client.put("/v1/companies/id-1", json={"name": "alpha ltd"}), 200)


def test_update_to_other_name_is_409(client: TestClient) -> None:
    assert_envelope(client.put("/v1/companies/id-1", json={"name": "Beta Ltd"}), 409)


def test_failed_update_leaves_company_unchanged(client: TestClient) -> None:
    payload = {"name": "Renamed Ltd", "timezone": "Mars/Base"}
    assert_envelope(client.put("/v1/companies/id-1", json=payload), 422)
    body = assert_envelope(client.get("/v1/companies/id-1"), 200)
    assert body["data"]["name"] == "Alpha Ltd"


def test_update_missing_is_404(client: TestClient) -> None:
    assert_envelope(client.put("/v1/companies/nope", json={"name": "Whatever"}), 404)


def test_delete_then_get_is_404(client: TestClient) -> None:
    body = assert_envelope(client.delete("/v1/companies/id-3"), 200)
    assert body["data"] is None
    assert_envelope(client.get("/v1/companies/id-3"), 404)


def test_delete_missing_is_404(client: TestClient) -> None:
    assert_envelope(client.delete("/v1/companies/nope"), 404)
