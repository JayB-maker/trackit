from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from ..schemas import SummaryOut, AnalyticsOut
from ..services import summary
from .. import crud

router = APIRouter(prefix="/summaries", tags=["summaries"])


@router.get("/", response_model=SummaryOut)
def get_summary(
    period: str = Query(default="month", pattern="^(today|week|month)$"),
    anchor_date: date = Query(default=date.today()),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return summary.build_summary(db, user.id, period, anchor_date)


@router.get("/analytics", response_model=AnalyticsOut)
def analytics(
    period: str = Query(default="month", pattern="^(today|week|month)$"),
    anchor_date: date = Query(default=date.today()),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    summary_data = summary.build_summary(db, user.id, period, anchor_date)
    trend = summary.trend_for(db, user.id, period, anchor_date)
    total_count = len(crud.list_expenses(db, user.id, summary_data["start_date"], summary_data["end_date"]))
    return {
        "total_spent": summary_data["total_spent"],
        "total_count": total_count,
        "top_category": summary_data["top_category"],
        "trend": trend,
    }
