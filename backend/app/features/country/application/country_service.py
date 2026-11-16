import re
from dataclasses import replace

from app.features.country.application.interface import CountryRepositoryInterface
from app.features.country.domain import (
    Country,
    CountryNotFoundError,
    CountryValidationError,
    DuplicateCountryNameError,
    DuplicateIsoCodeError,
    InvalidIsoCodeError,
    InvalidPhoneCodeError,
)

ISO_PATTERN = re.compile(r"^[A-Za-z]{2}$")
PHONE_CODE_PATTERN = re.compile(r"^\+[0-9]{1,4}$")
NAME_LIMITS = (2, 100)


class CountryService:
    """Use cases and business rules for countries."""

    def __init__(self, repository: CountryRepositoryInterface) -> None:
        self.repository = repository

    async def create(self, name: str, iso_code: str, phone_code: str) -> Country:
        """Create a country after validating every field.

        Raises:
            CountryValidationError: A field breaks its rule.
            DuplicateCountryNameError: The name is already taken.
            DuplicateIsoCodeError: The ISO code is already taken.
        """
        clean = self._validate({"name": name, "iso_code": iso_code, "phone_code": phone_code})
        await self._ensure_unique(clean)
        country = Country(id=self.repository.generate_id(), **clean)
        return await self.repository.create(country)

    async def get_by_id(self, country_id: str) -> Country:
        """Return a country or raise CountryNotFoundError."""
        country = await self.repository.get_by_id(country_id)
        if country is None:
            raise CountryNotFoundError(country_id)
        return country

    async def list(self, page: int, limit: int) -> tuple[list[Country], int]:
        """Return one page of countries and the overall total."""
        return await self.repository.list((page - 1) * limit, limit)

    async def update(
        self,
        country_id: str,
        name: str | None = None,
        iso_code: str | None = None,
        phone_code: str | None = None,
    ) -> Country:
        """Apply the supplied fields to a country.

        Changes are validated first and applied to a copy, so a failed update leaves the
        stored country untouched.
        """
        country = await self.get_by_id(country_id)
        supplied = {"name": name, "iso_code": iso_code, "phone_code": phone_code}
        changes = self._validate({k: v for k, v in supplied.items() if v is not None})
        await self._ensure_unique(changes, exclude_id=country.id)
        return await self.repository.update(replace(country, **changes))

    async def delete(self, country_id: str) -> None:
        """Delete a country or raise CountryNotFoundError."""
        await self.get_by_id(country_id)
        await self.repository.delete(country_id)

    async def _ensure_unique(self, values: dict[str, str], exclude_id: str | None = None) -> None:
        if "name" in values:
            existing = await self.repository.get_by_name(values["name"])
            if existing is not None and existing.id != exclude_id:
                raise DuplicateCountryNameError(values["name"])
        if "iso_code" in values:
            existing = await self.repository.get_by_iso_code(values["iso_code"])
            if existing is not None and existing.id != exclude_id:
                raise DuplicateIsoCodeError(values["iso_code"])

    @staticmethod
    def _validate(values: dict[str, str]) -> dict[str, str]:
        """Trim and check each supplied field, returning the cleaned values."""
        clean = {key: value.strip() for key, value in values.items()}
        low, high = NAME_LIMITS
        if "name" in clean and not low <= len(clean["name"]) <= high:
            raise CountryValidationError(
                "name", f"name must be between {low} and {high} characters."
            )
        if "iso_code" in clean:
            if not ISO_PATTERN.match(clean["iso_code"]):
                raise InvalidIsoCodeError(clean["iso_code"])
            clean["iso_code"] = clean["iso_code"].upper()
        if "phone_code" in clean and not PHONE_CODE_PATTERN.match(clean["phone_code"]):
            raise InvalidPhoneCodeError(clean["phone_code"])
        return clean
