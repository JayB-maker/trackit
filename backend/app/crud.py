from datetime import date, timedelta, datetime
import secrets
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models
from .security import hash_password, verify_password


DEFAULT_CATEGORIES = [
    "Food",
    "Transport",
    "Airtime",
    "Utilities",
    "Rent",
    "School",
    "Health",
    "Entertainment",
    "Savings",
    "Uncategorized",
]


def create_user(db: Session, email: str | None, password: str | None, telegram_id: str | None):
    normalized_email = email.lower() if email else None
    user = models.User(email=normalized_email, telegram_id=telegram_id)
    if password:
        user.password_hash = hash_password(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    ensure_default_categories(db, user.id)
    return user


def ensure_default_categories(db: Session, user_id: int):
    existing = db.query(models.Category).filter_by(user_id=user_id).count()
    if existing:
        return
    for name in DEFAULT_CATEGORIES:
        db.add(models.Category(user_id=user_id, name=name, default_flag=(name == "Uncategorized")))
    db.commit()


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.password_hash:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def get_user_by_token_subject(db: Session, subject: str):
    if subject.startswith("telegram:"):
        telegram_id = subject.replace("telegram:", "", 1)
        return db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if subject.startswith("guest:"):
        user_id = subject.replace("guest:", "", 1)
        return db.query(models.User).filter(models.User.id == int(user_id)).first()
    return db.query(models.User).filter(models.User.email == subject).first()


def get_or_create_telegram_user(db: Session, telegram_id: str):
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if user:
        return user
    return create_user(db, email=None, password=None, telegram_id=telegram_id)


def create_category(db: Session, user_id: int, name: str, default_flag: bool = False):
    category = models.Category(user_id=user_id, name=name, default_flag=default_flag)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def list_categories(db: Session, user_id: int):
    return db.query(models.Category).filter_by(user_id=user_id).order_by(models.Category.name).all()


def get_category(db: Session, user_id: int, category_id: int):
    return db.query(models.Category).filter_by(user_id=user_id, id=category_id).first()


def get_uncategorized(db: Session, user_id: int):
    category = (
        db.query(models.Category)
        .filter_by(user_id=user_id, default_flag=True)
        .order_by(models.Category.id)
        .first()
    )
    if not category:
        category = create_category(db, user_id, "Uncategorized", True)
    return category


def create_expense(db: Session, user_id: int, data):
    if data.date > date.today():
        raise ValueError("Future dates are not allowed")

    category = get_category(db, user_id, data.category_id)
    if not category:
        raise ValueError("Category not found")

    if not data.allow_duplicate:
        duplicate = (
            db.query(models.Expense)
            .filter(
                models.Expense.user_id == user_id,
                models.Expense.amount == data.amount,
                models.Expense.category_id == data.category_id,
                models.Expense.date == data.date,
                models.Expense.description == data.description,
            )
            .first()
        )
        if duplicate:
            raise ValueError("Duplicate expense detected")

    expense = models.Expense(
        user_id=user_id,
        amount=data.amount,
        category_id=data.category_id,
        description=data.description,
        date=data.date,
        is_recurring=data.is_recurring,
        recurring_period=data.recurring_period,
    )

    if data.is_recurring and data.recurring_period:
        expense.next_due_date = _next_due_date(data.date, data.recurring_period)

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def update_expense(db: Session, user_id: int, expense_id: int, data):
    expense = db.query(models.Expense).filter_by(user_id=user_id, id=expense_id).first()
    if not expense:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        if key == "category_id":
            category = get_category(db, user_id, value)
            if not category:
                raise ValueError("Category not found")
        setattr(expense, key, value)

    expense.updated_at = func.now()
    if expense.date and expense.date > date.today():
        raise ValueError("Future dates are not allowed")
    if expense.is_recurring and expense.recurring_period:
        expense.next_due_date = _next_due_date(expense.date, expense.recurring_period)

    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, user_id: int, expense_id: int):
    expense = db.query(models.Expense).filter_by(user_id=user_id, id=expense_id).first()
    if not expense:
        return False
    db.delete(expense)
    db.commit()
    return True


def list_expenses(db: Session, user_id: int, start_date: date, end_date: date):
    return (
        db.query(models.Expense)
        .filter(
            models.Expense.user_id == user_id,
            models.Expense.date >= start_date,
            models.Expense.date <= end_date,
        )
        .order_by(models.Expense.date.desc())
        .all()
    )


def create_budget(db: Session, user_id: int, category_id: int, limit_amount: float, period: str):
    budget = (
        db.query(models.Budget)
        .filter_by(user_id=user_id, category_id=category_id, period=period)
        .first()
    )
    if budget:
        budget.limit_amount = limit_amount
    else:
        budget = models.Budget(
            user_id=user_id, category_id=category_id, limit_amount=limit_amount, period=period
        )
        db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def list_budgets(db: Session, user_id: int):
    return db.query(models.Budget).filter_by(user_id=user_id).all()


def expense_totals_by_category(db: Session, user_id: int, start_date: date, end_date: date):
    rows = (
        db.query(models.Category.name, func.sum(models.Expense.amount))
        .join(models.Expense, models.Expense.category_id == models.Category.id)
        .filter(
            models.Expense.user_id == user_id,
            models.Expense.date >= start_date,
            models.Expense.date <= end_date,
        )
        .group_by(models.Category.name)
        .all()
    )
    return rows


def total_spent(db: Session, user_id: int, start_date: date, end_date: date):
    total = (
        db.query(func.sum(models.Expense.amount))
        .filter(
            models.Expense.user_id == user_id,
            models.Expense.date >= start_date,
            models.Expense.date <= end_date,
        )
        .scalar()
    )
    return float(total or 0)


def process_recurring(db: Session, user_id: int, as_of: date):
    recurring = (
        db.query(models.Expense)
        .filter(
            models.Expense.user_id == user_id,
            models.Expense.is_recurring.is_(True),
            models.Expense.next_due_date <= as_of,
        )
        .all()
    )
    created = []
    for item in recurring:
        new_expense = models.Expense(
            user_id=user_id,
            category_id=item.category_id,
            amount=item.amount,
            description=item.description,
            date=item.next_due_date,
            is_recurring=False,
        )
        db.add(new_expense)
        item.next_due_date = _next_due_date(item.next_due_date, item.recurring_period)
        created.append(new_expense)
    db.commit()
    return created


def _next_due_date(current: date, period: str):
    if period == "daily":
        return current + timedelta(days=1)
    if period == "weekly":
        return current + timedelta(days=7)
    if period == "monthly":
        return current + timedelta(days=30)
    return current + timedelta(days=30)


def create_email_link_token(db: Session, user_id: int, email: str, ttl_minutes: int = 10):
    code = str(secrets.randbelow(900000) + 100000)
    expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)
    token = models.EmailLinkToken(
        user_id=user_id, email=email.lower(), code=code, expires_at=expires_at
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def verify_email_link_token(db: Session, email: str, code: str):
    token = (
        db.query(models.EmailLinkToken)
        .filter_by(email=email.lower(), code=code, used=False)
        .order_by(models.EmailLinkToken.id.desc())
        .first()
    )
    if not token:
        return None, "Invalid code"
    if token.expires_at < datetime.utcnow():
        return None, "Code expired"
    if token.attempts >= 5:
        return None, "Too many attempts"
    return token, None


def mark_link_token_used(db: Session, token: models.EmailLinkToken):
    token.used = True
    db.commit()
    db.refresh(token)
    return token
