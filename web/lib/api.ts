const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export const auth = {
  async login(email: string, password: string) {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  }
};

export const authGuest = async () => {
  const res = await fetch(`${API_BASE}/api/v1/auth/guest`, { method: "POST" });
  if (!res.ok) throw new Error("Guest login failed");
  return res.json();
};

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("trackit_token") || "";
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("trackit_token", token);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

import type { Category, Expense, Summary, Budget } from "./types";

export const api = {
  categories: () => apiFetch<Category[]>("/api/v1/categories/"),
  createCategory: (payload: unknown) =>
    apiFetch<Category>("/api/v1/categories/", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiFetch("/api/v1/users/me"),
  expenses: (start: string, end: string) =>
    apiFetch<Expense[]>(`/api/v1/expenses/?start_date=${start}&end_date=${end}`),
  createExpense: (payload: unknown) => apiFetch<Expense>("/api/v1/expenses/", { method: "POST", body: JSON.stringify(payload) }),
  summary: (period: string) => apiFetch<Summary>(`/api/v1/summaries/?period=${period}`),
  budgets: () => apiFetch<Budget[]>("/api/v1/budgets/"),
  createBudget: (payload: unknown) => apiFetch<Budget>("/api/v1/budgets/", { method: "POST", body: JSON.stringify(payload) }),
  linkVerify: (payload: unknown) => apiFetch<{ access_token: string }>("/api/v1/link/verify", { method: "POST", body: JSON.stringify(payload) })
};
