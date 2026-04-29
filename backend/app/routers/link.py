from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from .. import crud, schemas, models
from ..security import hash_password, create_access_token
from ..email_utils import send_email_code

router = APIRouter(prefix="/link", tags=["linking"])


@router.post("/request")
def request_link(payload: schemas.EmailLinkRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    email = payload.email.lower()
    existing = db.query(models.User).filter(models.User.email == email, models.User.id != user.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")
    token = crud.create_email_link_token(db, user.id, email)
    try:
        send_email_code(email, token.code)
        return {"status": "sent", "expires_at": token.expires_at}
    except RuntimeError:
        # Dev fallback: return code if SMTP is not configured.
        return {"status": "dev", "code": token.code, "expires_at": token.expires_at}


@router.post("/verify")
def verify_link(payload: schemas.EmailLinkVerify, db: Session = Depends(get_db)):
    if len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password too long")
    token, error = crud.verify_email_link_token(db, payload.email, payload.code)
    if error:
        if token:
            token.attempts += 1
            db.commit()
        raise HTTPException(status_code=400, detail=error)

    user = db.query(models.User).filter_by(id=token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    normalized_email = payload.email.lower()
    if user.email and user.email != normalized_email:
        raise HTTPException(status_code=409, detail="Email already linked to another account")

    user.email = normalized_email
    user.password_hash = hash_password(payload.password)
    crud.mark_link_token_used(db, token)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.email)
    return {"access_token": access_token, "token_type": "bearer"}
