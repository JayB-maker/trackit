from datetime import date, timedelta


def range_for(period: str, anchor_date: date):
    if period == "today":
        start = anchor_date
        end = anchor_date
    elif period == "week":
        start = anchor_date - timedelta(days=anchor_date.weekday())
        end = start + timedelta(days=6)
    else:
        start = anchor_date.replace(day=1)
        end = _month_end(anchor_date)
    return start, end


def _month_end(anchor_date: date):
    if anchor_date.month == 12:
        return date(anchor_date.year, 12, 31)
    next_month = date(anchor_date.year, anchor_date.month + 1, 1)
    return next_month - timedelta(days=1)
