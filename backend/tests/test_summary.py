from datetime import date
from app.database import SessionLocal, Base, engine
from app import crud
from app.services import summary


def setup_module():
    Base.metadata.create_all(bind=engine)


def test_summary_totals():
    db = SessionLocal()
    user = crud.create_user(db, "summary@example.com", "secret123", None)
    category = crud.list_categories(db, user.id)[0]

    class Payload:
        def __init__(self, amount, category_id, description, date):
            self.amount = amount
            self.category_id = category_id
            self.description = description
            self.date = date
            self.is_recurring = False
            self.recurring_period = None
            self.allow_duplicate = True

    today = date.today()
    crud.create_expense(db, user.id, Payload(1000, category.id, "Breakfast", today))
    crud.create_expense(db, user.id, Payload(2000, category.id, "Dinner", today))

    summary_data = summary.build_summary(db, user.id, "today", today)
    assert summary_data["total_spent"] == 3000
    assert summary_data["top_category"] == category.name
    db.close()
