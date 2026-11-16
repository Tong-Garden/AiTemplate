from io import BytesIO

from fastapi.testclient import TestClient
from openpyxl import Workbook

from tests.conftest import assert_envelope, assert_list_meta

VALID: dict[str, str] = {
    "name": "Dan Doyle",
    "email": "dan@example.com",
    "phone": "+65 6000 0004",
}


def _xlsx(rows: list[list[str]]) -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    assert sheet is not None
    sheet.append(["name", "email", "phone", "status"])
    for row in rows:
        sheet.append(row)
    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()


def _upload(client: TestClient, name: str, content: bytes):  # type: ignore[no-untyped-def]
    return client.post("/v1/users/upload", files={"file": (name, content)})


def test_create_returns_201_and_envelope(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/users", json=VALID), 201)
    assert body["data"]["email"] == "dan@example.com"
    assert body["data"]["is_active"] is True
    assert body["data"]["id"]


def test_create_invalid_email_is_422_with_field(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/users", json={**VALID, "email": "not-an-email"}), 422)
    assert body["errors"][0]["type"] == "validation-error"
    assert body["errors"][0]["field"] == "email"


def test_create_missing_field_is_enveloped_422(client: TestClient) -> None:
    payload = {k: v for k, v in VALID.items() if k != "phone"}
    body = assert_envelope(client.post("/v1/users", json=payload), 422)
    assert body["errors"][0]["field"] == "phone"


def test_create_whitespace_name_is_422(client: TestClient) -> None:
    body = assert_envelope(client.post("/v1/users", json={**VALID, "name": "   "}), 422)
    assert body["errors"][0]["field"] == "name"


def test_create_duplicate_email_is_409(client: TestClient) -> None:
    body = assert_envelope(
        client.post("/v1/users", json={**VALID, "email": "alice@example.com"}), 409
    )
    assert body["errors"][0]["type"] == "conflict"


def test_list_is_paginated_with_meta(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/users?page=2&limit=2"), 200)
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


def test_list_defaults_to_page_1_limit_20(client: TestClient) -> None:
    meta = assert_list_meta(assert_envelope(client.get("/v1/users"), 200))
    assert (meta["page"], meta["limit"]) == (1, 20)


def test_list_limit_over_100_is_422_with_field(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/users?limit=101"), 422)
    assert body["errors"][0]["field"] == "limit"


def test_get_returns_user(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/users/id-2"), 200)
    assert body["data"]["name"] == "Bob Brown"


def test_get_missing_is_404(client: TestClient) -> None:
    body = assert_envelope(client.get("/v1/users/nope"), 404)
    assert body["errors"][0]["type"] == "not-found"


def test_update_changes_supplied_fields_only(client: TestClient) -> None:
    body = assert_envelope(client.put("/v1/users/id-1", json={"name": "Alice Zed"}), 200)
    assert body["data"]["name"] == "Alice Zed"
    assert body["data"]["email"] == "alice@example.com"


def test_update_can_deactivate(client: TestClient) -> None:
    body = assert_envelope(client.put("/v1/users/id-1", json={"is_active": False}), 200)
    assert body["data"]["is_active"] is False


def test_update_missing_is_404(client: TestClient) -> None:
    assert_envelope(client.put("/v1/users/nope", json={"name": "Someone"}), 404)


def test_update_duplicate_email_is_409(client: TestClient) -> None:
    assert_envelope(client.put("/v1/users/id-1", json={"email": "bob@example.com"}), 409)


def test_failed_update_leaves_user_unchanged(client: TestClient) -> None:
    assert_envelope(
        client.put("/v1/users/id-1", json={"name": "Changed Name", "email": "bob@example.com"}),
        409,
    )
    body = assert_envelope(client.get("/v1/users/id-1"), 200)
    assert body["data"]["name"] == "Alice Anders"


def test_delete_then_get_is_404(client: TestClient) -> None:
    body = assert_envelope(client.delete("/v1/users/id-1"), 200)
    assert body["data"] is None
    assert_envelope(client.get("/v1/users/id-1"), 404)


def test_delete_missing_is_404(client: TestClient) -> None:
    assert_envelope(client.delete("/v1/users/nope"), 404)


def test_upload_stores_every_row_with_its_own_id(client: TestClient) -> None:
    content = _xlsx(
        [
            ["Eve Ellis", "eve@example.com", "+65 6000 0005", "active"],
            ["Finn Fox", "finn@example.com", "+65 6000 0006", "inactive"],
        ]
    )
    body = assert_envelope(_upload(client, "users.xlsx", content), 200)
    assert body["data"] == {"count": 2}
    meta = assert_list_meta(assert_envelope(client.get("/v1/users"), 200))
    assert meta["total"] == 5


def test_upload_respects_status_column(client: TestClient) -> None:
    content = _xlsx([["Finn Fox", "finn@example.com", "+65 6000 0006", "inactive"]])
    assert_envelope(_upload(client, "users.xlsx", content), 200)
    users = client.get("/v1/users").json()["data"]
    finn = next(user for user in users if user["email"] == "finn@example.com")
    assert finn["is_active"] is False


def test_upload_skips_existing_email(client: TestClient) -> None:
    content = _xlsx([["Alice Again", "alice@example.com", "+65 6000 0009", "active"]])
    body = assert_envelope(_upload(client, "users.xlsx", content), 200)
    assert body["data"] == {"count": 0}


def test_upload_non_excel_is_400(client: TestClient) -> None:
    body = assert_envelope(_upload(client, "users.txt", b"hello"), 400)
    assert body["errors"][0]["type"] == "bad-request"


def test_upload_corrupt_excel_is_400(client: TestClient) -> None:
    assert_envelope(_upload(client, "users.xlsx", b"not a workbook"), 400)


def test_upload_skips_invalid_rows(client: TestClient) -> None:
    content = _xlsx(
        [
            ["Eve Ellis", "not-an-email", "+65 6000 0005", "active"],
            ["Finn Fox", "finn@example.com", "+65 6000 0006", "active"],
        ]
    )
    body = assert_envelope(_upload(client, "users.xlsx", content), 200)
    assert body["data"] == {"count": 1}


def test_upload_accepts_uppercase_extension(client: TestClient) -> None:
    content = _xlsx([["Finn Fox", "finn@example.com", "+65 6000 0006", "active"]])
    assert_envelope(_upload(client, "USERS.XLSX", content), 200)


def test_upload_over_size_limit_is_400(client: TestClient) -> None:
    body = assert_envelope(_upload(client, "users.xlsx", b"0" * (5 * 1024 * 1024 + 1)), 400)
    assert body["errors"][0]["type"] == "bad-request"


def test_upload_corrupt_excel_does_not_leak_internals(client: TestClient) -> None:
    body = assert_envelope(_upload(client, "users.xlsx", b"not a workbook"), 400)
    assert body["errors"][0]["detail"] == "The file could not be read as an Excel workbook"
