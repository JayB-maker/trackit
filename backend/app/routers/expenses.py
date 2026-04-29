from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from .. import crud, schemas

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/", response_model=list[schemas.ExpenseOut])
def list_all(
    start_date: date = Query(default=date.today()),
    end_date: date = Query(default=date.today()),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return crud.list_expenses(db, user.id, start_date, end_date)


@router.post("/", response_model=schemas.ExpenseOut)
def create(payload: schemas.ExpenseCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        return crud.create_expense(db, user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/{expense_id}", response_model=schemas.ExpenseOut)
def update(
    expense_id: int,
    payload: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        expense = crud.update_expense(db, user.id, expense_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.delete("/{expense_id}")
def delete(expense_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ok = crud.delete_expense(db, user.id, expense_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"status": "deleted"}
