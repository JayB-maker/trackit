from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from .. import crud, schemas

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=list[schemas.CategoryOut])
def list_all(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud.list_categories(db, user.id)


@router.post("/", response_model=schemas.CategoryOut)
def create(payload: schemas.CategoryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud.create_category(db, user.id, payload.name, payload.default_flag)


@router.delete("/{category_id}")
def delete(category_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    category = crud.get_category(db, user.id, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"status": "deleted"}
