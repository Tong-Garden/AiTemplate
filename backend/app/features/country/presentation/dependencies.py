from typing import AsyncGenerator

from app.features.country.application import CountryRepositoryInterface, CountryService
from app.features.country.infrastructure import SAMPLE_COUNTRIES, InMemoryCountryRepository

_repository: CountryRepositoryInterface = InMemoryCountryRepository()


async def initialize_sample_data() -> None:
    """Load the sample countries into the in-memory repository on startup."""
    await _repository.load_countries(SAMPLE_COUNTRIES)


async def get_country_service() -> AsyncGenerator[CountryService, None]:
    """Inject the repository interface, not the concrete class, into the service."""
    yield CountryService(repository=_repository)
