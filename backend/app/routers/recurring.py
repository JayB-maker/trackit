from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from .. import crud

router = APIRouter(prefix="/recurring", tags=["recurring"])


@router.post("/process")
def process_recurring(db: Session = Depends(get_db), user=Depends(get_current_user)):
    created = crud.process_recurring(db, user.id, date.today())
    return {"created": len(created)}
