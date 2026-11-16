"""Company ORM model.

Schema reference only — NOT wired up. App uses InMemoryRepository.
"""

from datetime import datetime

from sqlalchemy import Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base import Base


class CompanyModel(Base):
    """Company database schema."""

    __tablename__ = "companies"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False)
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
Index("uq_companies_name_lower", func.lower(CompanyModel.name), unique=True)
