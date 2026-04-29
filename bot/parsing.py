import re
from datetime import date, timedelta

AMOUNT_RE = re.compile(r"(₦|ngn|naira)?\s*(\d+(?:\.\d+)?)(k)?", re.IGNORECASE)


def parse_amount(text: str) -> float:
    match = AMOUNT_RE.search(text)
    if not match:
        raise ValueError("Amount not found")
    value = float(match.group(2))
    if match.group(3):
        value *= 1000
    return value


def parse_date(text: str) -> date:
    lower = text.lower()
    if "yesterday" in lower:
        return date.today() - timedelta(days=1)
    if "today" in lower:
        return date.today()
    if "tomorrow" in lower:
        return date.today() + timedelta(days=1)
    return date.today()


def parse_category(text: str) -> str | None:
    tokens = re.findall(r"[a-zA-Z]+", text)
    if not tokens:
        return None
    if tokens[-1].lower() in {"today", "yesterday", "tomorrow"}:
        tokens = tokens[:-1]
    return tokens[-1].capitalize() if tokens else None


def parse_quick(text: str):
    amount = parse_amount(text)
    when = parse_date(text)
    category = parse_category(text)
    return amount, category, when
