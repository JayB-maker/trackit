from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from .. import crud, schemas

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/", response_model=list[schemas.BudgetOut])
def list_all(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud.list_budgets(db, user.id)


@router.post("/", response_model=schemas.BudgetOut)
def create(payload: schemas.BudgetCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud.create_budget(db, user.id, payload.category_id, payload.limit_amount, payload.period)
