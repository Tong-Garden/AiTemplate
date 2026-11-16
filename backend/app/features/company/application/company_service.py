import re
from dataclasses import replace
from functools import lru_cache
from zoneinfo import available_timezones

from app.features.company.application.interface import CompanyRepositoryInterface
from app.features.company.domain import (
    Company,
    CompanyNotFoundError,
    CompanyValidationError,
    DuplicateCompanyNameError,
    InvalidPhoneNumberError,
    InvalidTimezoneError,
)

PHONE_PATTERN = re.compile(r"^\+?[0-9\s\-()]{7,20}$")
LENGTH_LIMITS = {"name": (2, 255), "address": (5, 500)}


@lru_cache(maxsize=1)
def _known_timezones() -> frozenset[str]:
    """Load the IANA names once; scanning the tz database on every request is slow."""
    return frozenset(available_timezones())


class CompanyService:
    """Use cases and business rules for companies."""

    def __init__(self, repository: CompanyRepositoryInterface) -> None:
        self.repository = repository

    async def create(self, name: str, address: str, phone_number: str, timezone: str) -> Company:
        """Create a company after validating every field.

        Raises:
            CompanyValidationError: A field breaks its rule.
            DuplicateCompanyNameError: The name is already taken.
        """
        clean = self._validate(
            {"name": name, "address": address, "phone_number": phone_number, "timezone": timezone}
        )
        await self._ensure_name_available(clean["name"])
        company = Company(id=self.repository.generate_id(), **clean)
        return await self.repository.create(company)

    async def get_by_id(self, company_id: str) -> Company:
        """Return a company or raise CompanyNotFoundError."""
        company = await self.repository.get_by_id(company_id)
        if company is None:
            raise CompanyNotFoundError(company_id)
        return company

    async def list(self, page: int, limit: int) -> tuple[list[Company], int]:
        """Return one page of companies and the overall total."""
        return await self.repository.list((page - 1) * limit, limit)

    async def update(
        self,
        company_id: str,
        name: str | None = None,
        address: str | None = None,
        phone_number: str | None = None,
        timezone: str | None = None,
    ) -> Company:
        """Apply the supplied fields to a company.

        Changes are validated first and applied to a copy, so a failed update leaves the
        stored company untouched.
        """
        company = await self.get_by_id(company_id)
        supplied = {
            "name": name,
            "address": address,
            "phone_number": phone_number,
            "timezone": timezone,
        }
        changes = self._validate({k: v for k, v in supplied.items() if v is not None})
        if "name" in changes:
            await self._ensure_name_available(changes["name"], exclude_id=company.id)
        return await self.repository.update(replace(company, **changes))

    async def delete(self, company_id: str) -> None:
        """Delete a company or raise CompanyNotFoundError."""
        await self.get_by_id(company_id)
        await self.repository.delete(company_id)

    async def _ensure_name_available(self, name: str, exclude_id: str | None = None) -> None:
        existing = await self.repository.get_by_name(name)
        if existing is not None and existing.id != exclude_id:
            raise DuplicateCompanyNameError(name)

    @staticmethod
    def _validate(values: dict[str, str]) -> dict[str, str]:
        """Trim and check each supplied field, returning the cleaned values."""
        clean = {key: value.strip() for key, value in values.items()}
        for field, (low, high) in LENGTH_LIMITS.items():
            if field in clean and not low <= len(clean[field]) <= high:
                raise CompanyValidationError(
                    field, f"{field} must be between {low} and {high} characters."
                )
        if "phone_number" in clean and not PHONE_PATTERN.match(clean["phone_number"]):
            raise InvalidPhoneNumberError(clean["phone_number"])
        if "timezone" in clean and clean["timezone"] not in _known_timezones():
            raise InvalidTimezoneError(clean["timezone"])
        return clean
