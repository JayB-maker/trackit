export type Category = {
  id: number;
  name: string;
  default_flag: boolean;
};

export type Expense = {
  id: number;
  amount: number;
  category_id: number;
  description?: string | null;
  date: string;
};

export type Summary = {
  period: string;
  start_date: string;
  end_date: string;
  total_spent: number;
  daily_average: number;
  top_category?: string | null;
  breakdown: { category: string; total: number }[];
};

export type Budget = {
  id: number;
  category_id: number;
  limit_amount: number;
  period: string;
};
