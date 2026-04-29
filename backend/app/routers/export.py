import csv
from datetime import date
from io import StringIO
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from .. import crud

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/csv")
def export_csv(
    start_date: date = Query(default=date.today().replace(day=1)),
    end_date: date = Query(default=date.today()),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    expenses = crud.list_expenses(db, user.id, start_date, end_date)
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Date", "Amount", "Category", "Description"])
    for expense in expenses:
        writer.writerow([expense.date.isoformat(), expense.amount, expense.category.name, expense.description])
    buffer.seek(0)
    filename = f"trackit_{start_date.isoformat()}_{end_date.isoformat()}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
