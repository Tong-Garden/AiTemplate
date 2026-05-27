from ...domain import User

SAMPLE_USERS = [
    User(
        id="550e8400-e29b-41d4-a716-446655440001",
        name="John Doe",
        email="john.doe@example.com",
        phone="+1234567890",
        is_active=True,
    ),
    User(
        id="550e8400-e29b-41d4-a716-446655440002",
        name="Jane Smith",
        email="jane.smith@example.com",
        phone="+0987654321",
        is_active=True,
    ),
    User(
        id="550e8400-e29b-41d4-a716-446655440003",
        name="Bob Johnson",
        email="bob.johnson@example.com",
        phone="+1122334455",
        is_active=False,
    ),
    User(
        id="550e8400-e29b-41d4-a716-446655440004",
        name="Alice Williams",
        email="alice.williams@example.com",
        phone="+5566778899",
        is_active=False,
    ),
    User(
        id="550e8400-e29b-41d4-a716-446655440005",
        name="Charlie Brown",
        email="charlie.brown@example.com",
        phone="+9988776655",
        is_active=True,
    ),
]
