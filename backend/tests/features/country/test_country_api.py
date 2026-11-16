from fastapi.testclient import TestClient

from tests.conftest import assert_envelope, assert_list_meta

VALID: dict[str, str] = {"name": "Germany", "iso_code": "DE", "phone_code": "+49"}


def test_create_returns_201_and_envelope(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/countries", json=VALID), 201)
    assert body["data"]["name"] == "Germany"
    assert body["data"]["id"]


def test_create_uppercases_iso_code(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/countries", json={**VALID, "iso_code": "de"}), 201)
    assert body["data"]["iso_code"] == "DE"


def test_create_invalid_iso_code_is_422_with_field(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/countries", json={**VALID, "iso_code": "D1"}), 422)
    assert body["errors"][0]["field"] == "iso_code"


def test_create_non_ascii_iso_code_is_422(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/countries", json={**VALID, "iso_code": "ıı"}), 422)
    assert body["errors"][0]["field"] == "iso_code"


def test_create_invalid_phone_code_is_422_with_field(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/countries", json={**VALID, "phone_code": "49"}), 422)
    assert body["errors"][0]["field"] == "phone_code"


def test_create_wrong_length_iso_is_enveloped_422(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/countries", json={**VALID, "iso_code": "DEU"}), 422)
    assert body["errors"][0]["field"] == "iso_code"


def test_create_missing_field_is_enveloped_422(client: TestClient) -> None:
    payload = {k: v for k, v in VALID.items() if k != "name"}
    body = assert_envelope(client.post("/v1/countries", json=payload), 422)
    assert body["errors"][0]["field"] == "name"


def test_create_duplicate_name_ignoring_case_is_409(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/countries", json={**VALID, "name": "SINGAPORE"}), 409)
    assert body["errors"][0]["type"] == "conflict"


def test_create_duplicate_iso_code_is_409(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/countries", json={**VALID, "iso_code": "sg"}), 409)
    assert body["errors"][0]["type"] == "conflict"


def test_create_shared_phone_code_is_allowed(client: TestClient) -> None:
    assert_envelope(client.post("/v1/countries", json={**VALID, "phone_code": "+1"}), 201)


def test_list_is_paginated_with_meta(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/countries?page=2&limit=2"), 200)
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


def test_list_rejects_limit_over_100(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/countries?limit=101"), 422)
    assert body["errors"][0]["field"] == "limit"


def test_get_by_id(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/countries/id-2"), 200)
    assert body["data"]["iso_code"] == "JP"
    assert body["meta"] == {}


def test_get_missing_is_404(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/countries/nope"), 404)
    assert body["errors"][0]["type"] == "not-found"


def test_update_changes_only_supplied_fields(client: TestClient) -> None:
    body = assert_envelope(client.put("/v1/countries/id-1", json={"phone_code": "+66"}), 200)
    assert body["data"]["phone_code"] == "+66"
    assert body["data"]["name"] == "Singapore"


def test_update_keeping_own_name_and_iso_is_allowed(client: TestClient) -> None:
    payload = {"name": "singapore", "iso_code": "sg"}
    assert_envelope(client.put("/v1/countries/id-1", json=payload), 200)


def test_update_to_other_iso_code_is_409(client: TestClient) -> None:
    assert_envelope(client.put("/v1/countries/id-1", json={"iso_code": "JP"}), 409)


def test_failed_update_leaves_country_unchanged(client: TestClient) -> None:
    payload = {"name": "Renamed", "phone_code": "bad"}
    assert_envelope(client.put("/v1/countries/id-1", json=payload), 422)
    body = assert_envelope(client.get("/v1/countries/id-1"), 200)
    assert body["data"]["name"] == "Singapore"


def test_update_missing_is_404(client: TestClient) -> None:
    assert_envelope(client.put("/v1/countries/nope", json={"name": "Whatever"}), 404)


def test_delete_then_get_is_404(client: TestClient) -> None:
    body = assert_envelope(client.delete("/v1/countries/id-3"), 200)
    assert body["data"] is None
    assert_envelope(client.get("/v1/countries/id-3"), 404)


def test_delete_missing_is_404(client: TestClient) -> None:
    assert_envelope(client.delete("/v1/countries/nope"), 404)
