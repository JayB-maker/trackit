from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    telegram_id: Optional[str] = None
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    password: Optional[str] = Field(default=None, min_length=6, max_length=72)


class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    default_flag: bool = False


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class ExpenseBase(BaseModel):
    amount: float = Field(gt=0, le=1_000_000_000)
    category_id: int
    description: Optional[str] = Field(default=None, max_length=240)
    date: date
    is_recurring: bool = False
    recurring_period: Optional[str] = Field(default=None, pattern="^(daily|weekly|monthly)$")


class ExpenseCreate(ExpenseBase):
    allow_duplicate: bool = False


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(default=None, gt=0, le=1_000_000_000)
    category_id: Optional[int] = None
    description: Optional[str] = Field(default=None, max_length=240)
    date: Optional[date] = None
    is_recurring: Optional[bool] = None
    recurring_period: Optional[str] = Field(default=None, pattern="^(daily|weekly|monthly)$")


class ExpenseOut(ExpenseBase):
    id: int

    class Config:
        from_attributes = True


class BudgetBase(BaseModel):
    category_id: int
    limit_amount: float = Field(gt=0, le=1_000_000_000)
    period: str = Field(default="monthly", pattern="^(daily|weekly|monthly)$")


class BudgetCreate(BudgetBase):
    pass


class BudgetOut(BudgetBase):
    id: int

    class Config:
        from_attributes = True


class SummaryItem(BaseModel):
    category: str
    total: float


class SummaryOut(BaseModel):
    period: str
    start_date: date
    end_date: date
    total_spent: float
    daily_average: float
    top_category: Optional[str]
    breakdown: List[SummaryItem]


class AnalyticsOut(BaseModel):
    total_spent: float
    total_count: int
    top_category: Optional[str]
    trend: List[float]


class ReminderBase(BaseModel):
    message: str
    schedule: str
    active: bool = True


class ReminderOut(ReminderBase):
    id: int

    class Config:
        from_attributes = True


class EmailLinkRequest(BaseModel):
    email: EmailStr


class EmailLinkVerify(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=8)
    password: str = Field(min_length=6, max_length=72)
