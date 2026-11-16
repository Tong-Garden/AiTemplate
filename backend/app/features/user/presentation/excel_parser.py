from openpyxl import load_workbook

from ..domain import User
from .mapper import UserMapper


class ExcelParser:
    """Parse Excel files uploaded via HTTP."""

    REQUIRED_COLUMNS = {"name", "email", "phone", "status"}

    @staticmethod
    def parse_users(file_path: str) -> list[User]:
        users = []
        try:
            workbook = load_workbook(file_path)
            worksheet = workbook.active

            headers = [cell.value for cell in worksheet[1]]
            header_lower = [str(h).lower().strip() if h else "" for h in headers]

            col_indices = {}
            for col_name in ExcelParser.REQUIRED_COLUMNS:
                try:
                    col_indices[col_name] = header_lower.index(col_name)
                except ValueError:
                    raise ValueError(f"Missing required column: {col_name}")

            for row_idx, row in enumerate(
                worksheet.iter_rows(min_row=2, values_only=True), start=2
            ):
                if not any(row):
                    continue

                try:
                    status = row[col_indices["status"]]
                    row_data = {
                        "name": row[col_indices["name"]],
                        "email": row[col_indices["email"]],
                        "phone": row[col_indices["phone"]],
                    }

                    if all(row_data.values()) and status is not None and status != "":
                        row_data = {key: str(value).strip() for key, value in row_data.items()}
                        row_data["is_active"] = (
                            status if isinstance(status, bool) else str(status).strip()
                        )
                        user = UserMapper.from_excel_row(row_data)
                        users.append(user)
                except (IndexError, TypeError, ValueError):
                    continue

            workbook.close()
        except ValueError:
            raise
        except Exception:
            raise ValueError("The file could not be read as an Excel workbook")

        return users
