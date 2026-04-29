from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas, models
from ..security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if payload.email is None:
        raise HTTPException(status_code=400, detail="Email is required")
    if not payload.password:
        raise HTTPException(status_code=400, detail="Password is required")
    if len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password too long")
    existing = db.query(models.User).filter_by(email=payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = crud.create_user(db, payload.email, payload.password, None)
    return user


@router.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(user.email)
    return schemas.Token(access_token=token)


@router.post("/telegram", response_model=schemas.Token)
def telegram_login(telegram_id: str, db: Session = Depends(get_db)):
    user = crud.get_or_create_telegram_user(db, telegram_id)
    token = create_access_token(f"telegram:{user.telegram_id}")
    return schemas.Token(access_token=token)


@router.post("/guest", response_model=schemas.Token)
def guest_login(db: Session = Depends(get_db)):
    user = crud.create_user(db, email=None, password=None, telegram_id=None)
    token = create_access_token(f"guest:{user.id}")
    return schemas.Token(access_token=token)
