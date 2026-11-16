from app.features.country.domain import Country
from app.features.country.presentation.schemas import CountryResponse


class CountryMapper:
    """Maps domain entities to presentation schemas."""

    @staticmethod
    def to_response(country: Country) -> CountryResponse:
        """Convert a domain entity to its HTTP response DTO."""
        return CountryResponse(
            id=country.id,
            name=country.name,
            iso_code=country.iso_code,
            phone_code=country.phone_code,
        )

    @staticmethod
    def to_response_list(countries: list[Country]) -> list[CountryResponse]:
        """Convert domain entities to HTTP response DTOs."""
        return [CountryMapper.to_response(country) for country in countries]
