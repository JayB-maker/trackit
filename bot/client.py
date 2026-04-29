import httpx
from .config import BACKEND_URL


def _url(path: str) -> str:
    return f"{BACKEND_URL}{path}"


def get_token_for_telegram(telegram_id: str) -> str:
    response = httpx.post(_url("/api/v1/auth/telegram"), params={"telegram_id": telegram_id})
    response.raise_for_status()
    return response.json()["access_token"]


def get_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


def list_categories(token: str):
    response = httpx.get(_url("/api/v1/categories/"), headers=get_headers(token))
    response.raise_for_status()
    return response.json()


def create_expense(token: str, payload: dict):
    response = httpx.post(_url("/api/v1/expenses/"), json=payload, headers=get_headers(token))
    response.raise_for_status()
    return response.json()


def list_expenses(token: str, start_date: str, end_date: str):
    response = httpx.get(
        _url("/api/v1/expenses/"),
        params={"start_date": start_date, "end_date": end_date},
        headers=get_headers(token),
    )
    response.raise_for_status()
    return response.json()


def get_summary(token: str, period: str):
    response = httpx.get(
        _url("/api/v1/summaries/"),
        params={"period": period},
        headers=get_headers(token),
    )
    response.raise_for_status()
    return response.json()


def list_budgets(token: str):
    response = httpx.get(_url("/api/v1/budgets/"), headers=get_headers(token))
    response.raise_for_status()
    return response.json()


def create_budget(token: str, payload: dict):
    response = httpx.post(_url("/api/v1/budgets/"), json=payload, headers=get_headers(token))
    response.raise_for_status()
    return response.json()


def delete_expense(token: str, expense_id: int):
    response = httpx.delete(_url(f"/api/v1/expenses/{expense_id}"), headers=get_headers(token))
    response.raise_for_status()
    return response.json()


def update_expense(token: str, expense_id: int, payload: dict):
    response = httpx.put(
        _url(f"/api/v1/expenses/{expense_id}"), json=payload, headers=get_headers(token)
    )
    response.raise_for_status()
    return response.json()


def export_csv(token: str):
    response = httpx.get(_url("/api/v1/export/csv"), headers=get_headers(token))
    response.raise_for_status()
    return response.text


def request_email_link(token: str, email: str):
    response = httpx.post(
        _url("/api/v1/link/request"),
        json={"email": email},
        headers=get_headers(token),
    )
    response.raise_for_status()
    return response.json()
