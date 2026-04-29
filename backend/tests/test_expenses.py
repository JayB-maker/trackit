from datetime import date
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, Base, engine
from app import crud

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)


def test_duplicate_expense_rejected():
    db = SessionLocal()
    user = crud.create_user(db, "test@example.com", "secret123", None)
    category = crud.list_categories(db, user.id)[0]

    payload = {
        "amount": 2000,
        "category_id": category.id,
        "description": "Lunch",
        "date": date.today().isoformat(),
        "is_recurring": False,
        "recurring_period": None,
        "allow_duplicate": False,
    }

    token = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "secret123"},
    ).json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    first = client.post("/api/v1/expenses/", json=payload, headers=headers)
    assert first.status_code == 200

    second = client.post("/api/v1/expenses/", json=payload, headers=headers)
    assert second.status_code == 400
    db.close()
