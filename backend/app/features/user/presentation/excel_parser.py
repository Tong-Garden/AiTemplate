from typing import List

from openpyxl import load_workbook

from ..domain import User
from .mapper import UserMapper


class ExcelParser:
    """Parse Excel files uploaded via HTTP."""

    REQUIRED_COLUMNS = {"name", "email", "phone", "status"}

    @staticmethod
    def parse_users(file_path: str) -> List[User]:
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
                    row_data = {
                        "name": row[col_indices["name"]],
                        "email": row[col_indices["email"]],
                        "phone": row[col_indices["phone"]],
                        "status": row[col_indices["status"]],
                    }

                    if all(row_data.values()):
                        user = UserMapper.from_excel_row(row_data)
                        users.append(user)
                except (IndexError, TypeError, ValueError):
                    continue

            workbook.close()
        except FileNotFoundError:
            raise ValueError(f"File not found: {file_path}")
        except Exception as e:
            raise ValueError(f"Error parsing Excel file: {str(e)}")

        return users
