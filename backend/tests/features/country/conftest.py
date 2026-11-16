from typing import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.features.country.application import CountryService
from app.features.country.domain import Country
from app.features.country.infrastructure import InMemoryCountryRepository
from app.features.country.presentation import get_country_service, router


@pytest.fixture
def seeded_countries() -> list[Country]:
    """Three countries with distinct names and ISO codes."""
    return [
        Country("id-1", "Singapore", "SG", "+65"),
        Country("id-2", "Japan", "JP", "+81"),
        Country("id-3", "Canada", "CA", "+1"),
    ]


@pytest.fixture
def client(seeded_countries: list[Country]) -> Iterator[TestClient]:
    """TestClient on an app that mounts only the country router over a fresh repository."""
    repository = InMemoryCountryRepository()
    repository.countries = {country.id: country for country in seeded_countries}
    app = FastAPI()
    app.include_router(router, prefix="/v1")
    app.dependency_overrides[get_country_service] = lambda: CountryService(repository)
    with TestClient(app) as test_client:
        yield test_client
