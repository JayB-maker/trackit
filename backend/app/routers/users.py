from fastapi import APIRouter, Depends
from ..deps import get_current_user
from .. import schemas

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.UserOut)
def me(user=Depends(get_current_user)):
    return user
