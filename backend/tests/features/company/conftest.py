from typing import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.features.company.application import CompanyService
from app.features.company.domain import Company
from app.features.company.infrastructure import InMemoryCompanyRepository
from app.features.company.presentation import get_company_service, router


@pytest.fixture
def seeded_companies() -> list[Company]:
    """Three companies with distinct names for list and duplicate tests."""
    return [
        Company("id-1", "Alpha Ltd", "1 First Street", "+65 6000 0001", "Asia/Singapore"),
        Company("id-2", "Beta Ltd", "2 Second Street", "+65 6000 0002", "Asia/Tokyo"),
        Company("id-3", "Gamma Ltd", "3 Third Street", "+65 6000 0003", "Europe/London"),
    ]


@pytest.fixture
def client(seeded_companies: list[Company]) -> Iterator[TestClient]:
    """TestClient on an app that mounts only the company router over a fresh repository."""
    repository = InMemoryCompanyRepository()
    repository.companies = {company.id: company for company in seeded_companies}
    app = FastAPI()
    app.include_router(router, prefix="/v1")
    app.dependency_overrides[get_company_service] = lambda: CompanyService(repository)
    with TestClient(app) as test_client:
        yield test_client
