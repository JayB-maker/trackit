from datetime import date, timedelta
from . import dates
from .. import crud


def build_summary(db, user_id: int, period: str, anchor_date: date):
    start, end = dates.range_for(period, anchor_date)
    total = crud.total_spent(db, user_id, start, end)
    breakdown_rows = crud.expense_totals_by_category(db, user_id, start, end)
    breakdown = [
        {"category": name, "total": float(amount or 0)} for name, amount in breakdown_rows
    ]
    top_category = None
    if breakdown:
        top_category = max(breakdown, key=lambda x: x["total"])["category"]
    days = (end - start).days + 1
    daily_avg = round(total / days, 2) if days else 0
    return {
        "period": period,
        "start_date": start,
        "end_date": end,
        "total_spent": total,
        "daily_average": daily_avg,
        "top_category": top_category,
        "breakdown": breakdown,
    }


def trend_for(db, user_id: int, period: str, anchor_date: date):
    start, end = dates.range_for(period, anchor_date)
    days = (end - start).days + 1
    trend = []
    for i in range(days):
        day = start + timedelta(days=i)
        total = crud.total_spent(db, user_id, day, day)
        trend.append(total)
    return trend
