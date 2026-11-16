from app.features.company.domain import Company
from app.features.company.presentation.schemas import CompanyResponse


class CompanyMapper:
    """Maps domain entities to presentation schemas."""

    @staticmethod
    def to_response(company: Company) -> CompanyResponse:
        """Convert a domain entity to its HTTP response DTO."""
        return CompanyResponse(
            id=company.id,
            name=company.name,
            address=company.address,
            phone_number=company.phone_number,
            timezone=company.timezone,
        )

    @staticmethod
    def to_response_list(companies: list[Company]) -> list[CompanyResponse]:
        """Convert domain entities to HTTP response DTOs."""
        return [CompanyMapper.to_response(company) for company in companies]
