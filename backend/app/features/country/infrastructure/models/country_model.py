"""Country ORM model.

Schema reference only — NOT wired up. App uses InMemoryRepository.
"""

from datetime import datetime

from sqlalchemy import Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base import Base


class CountryModel(Base):
    """Country database schema."""

    __tablename__ = "countries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    iso_code: Mapped[str] = mapped_column(String(2), nullable=False, unique=True, index=True)
    phone_code: Mapped[str] = mapped_column(String(5), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        server_default=func.now(),
    )


# Case-insensitive uniqueness, matching the service rule. Declared after the class
# so the expression can reference the mapped column.
Index("uq_countries_name_lower", func.lower(CountryModel.name), unique=True)
