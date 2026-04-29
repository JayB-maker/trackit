import logging
import os
import threading
from dotenv import load_dotenv
from datetime import date, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from urllib.parse import urlparse
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, CallbackQueryHandler, filters

try:
    from .config import BOT_TOKEN
    from . import client
    from .parsing import parse_quick
except ImportError:
    from config import BOT_TOKEN
    import client
    from parsing import parse_quick

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

COMMANDS_TEXT = (
    "/add - guided expense entry\n"
    "/quick - quick add (e.g., 2000 food)\n"
    "/today - today's expenses\n"
    "/week - weekly summary\n"
    "/month - monthly summary\n"
    "/categories - list categories\n"
    "/budget - set/view budgets\n"
    "/delete - delete entry\n"
    "/edit - edit entry\n"
    "/report - analytics\n"
    "/export - download CSV\n"
    "/link - link email for web login"
)


def _format_amount(value: float) -> str:
    return f"₦{value:,.0f}"


async def ensure_token(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    if "token" not in context.user_data:
        telegram_id = str(update.effective_user.id)
        token = client.get_token_for_telegram(telegram_id)
        context.user_data["token"] = token
    return context.user_data["token"]


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    keyboard = InlineKeyboardMarkup(
        [
            [InlineKeyboardButton("Add expense", callback_data="add")],
            [InlineKeyboardButton("Quick add", callback_data="quick")],
            [InlineKeyboardButton("Today summary", callback_data="today")]
        ]
    )
    await update.message.reply_text(
        "Welcome to TrackIt NG. Your low-data finance tracker.\n\nCommands:\n"
        + COMMANDS_TEXT,
        reply_markup=keyboard,
    )


async def add(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    context.user_data["add_state"] = "amount"
    await update.message.reply_text("Enter the amount (e.g., 1500):")


async def quick(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    text = update.message.text.replace("/quick", "").strip()
    if not text:
        context.user_data["awaiting_quick"] = True
        await update.message.reply_text("Send like: 2000 food yesterday")
        return
    await _handle_quick_text(update, context, text)


async def _handle_quick_text(update: Update, context: ContextTypes.DEFAULT_TYPE, text: str):
    token = await ensure_token(update, context)
    try:
        amount, category_name, when = parse_quick(text)
        categories = client.list_categories(token)
        category_id = None
        for item in categories:
            if category_name and item["name"].lower() == category_name.lower():
                category_id = item["id"]
        if category_id is None:
            category_id = next((item["id"] for item in categories if item["default_flag"]), categories[0]["id"])
        payload = {
            "amount": amount,
            "category_id": category_id,
            "description": None,
            "date": when.isoformat(),
            "is_recurring": False,
            "recurring_period": None,
            "allow_duplicate": False,
        }
        expense = client.create_expense(token, payload)
        await update.message.reply_text(
            f"Saved {_format_amount(expense['amount'])} in {category_name or 'Uncategorized'}"
        )
    except Exception as exc:
        await update.message.reply_text(f"Could not add expense: {exc}")


async def today(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    await _send_summary(update, context, "today")


async def week(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    await _send_summary(update, context, "week")


async def month(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    await _send_summary(update, context, "month")


async def _send_summary(update: Update, context: ContextTypes.DEFAULT_TYPE, period: str):
    token = context.user_data["token"]
    data = client.get_summary(token, period)
    lines = [
        f"{period.capitalize()} summary",
        f"Total: {_format_amount(data['total_spent'])}",
        f"Average/day: {_format_amount(data['daily_average'])}",
    ]
    if data["top_category"]:
        lines.append(f"Top category: {data['top_category']}")
    await update.message.reply_text("\n".join(lines))


async def categories(update: Update, context: ContextTypes.DEFAULT_TYPE):
    token = await ensure_token(update, context)
    items = client.list_categories(token)
    lines = [f"- {item['name']}" for item in items]
    await update.message.reply_text("Categories:\n" + "\n".join(lines))


async def budget(update: Update, context: ContextTypes.DEFAULT_TYPE):
    token = await ensure_token(update, context)
    text = update.message.text.replace("/budget", "").strip()
    if not text:
        budgets = client.list_budgets(token)
        if not budgets:
            await update.message.reply_text("No budgets yet. Send: /budget Food 50000 monthly")
            return
        lines = [f"{item['category_id']} - {_format_amount(item['limit_amount'])} ({item['period']})" for item in budgets]
        await update.message.reply_text("Budgets:\n" + "\n".join(lines))
        return
    parts = text.split()
    if len(parts) < 2:
        await update.message.reply_text("Format: /budget Food 50000 monthly")
        return
    category_name = parts[0]
    limit = float(parts[1])
    period = parts[2] if len(parts) > 2 else "monthly"
    categories_list = client.list_categories(token)
    category_id = next((item["id"] for item in categories_list if item["name"].lower() == category_name.lower()), None)
    if not category_id:
        await update.message.reply_text("Category not found. Use /categories.")
        return
    budget_item = client.create_budget(
        token, {"category_id": category_id, "limit_amount": limit, "period": period}
    )
    await update.message.reply_text(
        f"Budget set: {_format_amount(budget_item['limit_amount'])} for {category_name} ({budget_item['period']})"
    )


async def delete(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    text = update.message.text.replace("/delete", "").strip()
    if not text:
        context.user_data["awaiting_delete"] = True
        await update.message.reply_text("Send the expense ID to delete.")
        return
    await _handle_delete(update, context, text)


async def _handle_delete(update: Update, context: ContextTypes.DEFAULT_TYPE, text: str):
    token = context.user_data["token"]
    try:
        expense_id = int(text)
        client.delete_expense(token, expense_id)
        await update.message.reply_text("Deleted.")
    except Exception as exc:
        await update.message.reply_text(f"Could not delete: {exc}")


async def edit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    text = update.message.text.replace("/edit", "").strip()
    if not text:
        context.user_data["awaiting_edit"] = True
        await update.message.reply_text("Send: <expense_id> <amount>")
        return
    await _handle_edit(update, context, text)


async def _handle_edit(update: Update, context: ContextTypes.DEFAULT_TYPE, text: str):
    token = context.user_data["token"]
    try:
        parts = text.split()
        expense_id = int(parts[0])
        amount = float(parts[1])
        expense = client.update_expense(token, expense_id, {"amount": amount})
        await update.message.reply_text(f"Updated to {_format_amount(expense['amount'])}")
    except Exception as exc:
        await update.message.reply_text(f"Could not edit: {exc}")


async def report(update: Update, context: ContextTypes.DEFAULT_TYPE):
    token = await ensure_token(update, context)
    data = client.get_summary(token, "month")
    message = (
        f"Monthly analytics\n"
        f"Total: {_format_amount(data['total_spent'])}\n"
        f"Top category: {data['top_category'] or 'N/A'}"
    )
    await update.message.reply_text(message)


async def export(update: Update, context: ContextTypes.DEFAULT_TYPE):
    token = await ensure_token(update, context)
    csv_data = client.export_csv(token)
    buffer = BytesIO(csv_data.encode("utf-8"))
    buffer.name = f"trackit_{date.today().isoformat()}.csv"
    await update.message.reply_document(document=buffer, filename=buffer.name, caption="Your CSV export")


async def link(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await ensure_token(update, context)
    text = update.message.text.replace("/link", "").strip()
    if not text:
        context.user_data["awaiting_link_email"] = True
        await update.message.reply_text("Send your email to link with the web app.")
        return
    await _handle_link_email(update, context, text)


async def _handle_link_email(update: Update, context: ContextTypes.DEFAULT_TYPE, email: str):
    token = context.user_data["token"]
    try:
        data = client.request_email_link(token, email)
        if data.get("status") == "sent":
            await update.message.reply_text(
                "Verification code sent to your email. Use it in the web app to finish linking.\n"
                "This code expires in 10 minutes."
            )
        else:
            await update.message.reply_text(
                "Verification code created (dev mode). Use this code in the web app:\n"
                f"{data.get('code')}\n"
                "This code expires in 10 minutes."
            )
    except Exception as exc:
        await update.message.reply_text(f"Could not link email: {exc}")


async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.user_data.get("awaiting_quick"):
        context.user_data["awaiting_quick"] = False
        await _handle_quick_text(update, context, update.message.text)
        return
    if context.user_data.get("awaiting_delete"):
        context.user_data["awaiting_delete"] = False
        await _handle_delete(update, context, update.message.text)
        return
    if context.user_data.get("awaiting_edit"):
        context.user_data["awaiting_edit"] = False
        await _handle_edit(update, context, update.message.text)
        return
    if context.user_data.get("awaiting_link_email"):
        context.user_data["awaiting_link_email"] = False
        await _handle_link_email(update, context, update.message.text)
        return
    if context.user_data.get("add_state") == "amount":
        try:
            amount = float(update.message.text)
            if amount <= 0:
                raise ValueError
            context.user_data["add_amount"] = amount
        except ValueError:
            await update.message.reply_text("Enter a valid amount.")
            return
        token = await ensure_token(update, context)
        categories_list = client.list_categories(token)
        context.user_data["add_categories"] = categories_list
        keyboard = [[item["name"]] for item in categories_list[:6]]
        await update.message.reply_text(
            "Select a category:", reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True)
        )
        context.user_data["add_state"] = "category"
        return
    if context.user_data.get("add_state") == "category":
        categories_list = context.user_data.get("add_categories", [])
        selected = update.message.text.strip().lower()
        category_id = None
        for item in categories_list:
            if item["name"].lower() == selected:
                category_id = item["id"]
        if category_id is None:
            await update.message.reply_text("Category not found. Try again.")
            return
        context.user_data["add_category_id"] = category_id
        context.user_data["add_state"] = "description"
        await update.message.reply_text("Add a short description or type 'skip':", reply_markup=ReplyKeyboardRemove())
        return
    if context.user_data.get("add_state") == "description":
        description = update.message.text.strip()
        if description.lower() == "skip":
            description = None
        context.user_data["add_description"] = description
        context.user_data["add_state"] = "date"
        await update.message.reply_text("Date? (today/yesterday) or type skip for today")
        return
    if context.user_data.get("add_state") == "date":
        date_text = update.message.text.strip().lower()
        if date_text in {"skip", "today"}:
            expense_date = date.today()
        elif date_text == "yesterday":
            expense_date = date.today() - timedelta(days=1)
        else:
            await update.message.reply_text("Use today, yesterday, or skip.")
            return
        token = await ensure_token(update, context)
        payload = {
            "amount": context.user_data["add_amount"],
            "category_id": context.user_data["add_category_id"],
            "description": context.user_data.get("add_description"),
            "date": expense_date.isoformat(),
            "is_recurring": False,
            "recurring_period": None,
            "allow_duplicate": False,
        }
        try:
            expense = client.create_expense(token, payload)
            await update.message.reply_text(
                f"Saved {_format_amount(expense['amount'])}.", reply_markup=ReplyKeyboardRemove()
            )
        except Exception as exc:
            await update.message.reply_text(f"Could not save: {exc}")
        context.user_data.pop("add_state", None)
        return


async def unknown(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("I didn't understand. Use /start to see commands.")


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if query.data == "add":
        context.user_data["add_state"] = "amount"
        await query.message.reply_text("Enter the amount (e.g., 1500):")
    elif query.data == "quick":
        context.user_data["awaiting_quick"] = True
        await query.message.reply_text("Send like: 2000 food yesterday")
    elif query.data == "today":
        token = await ensure_token(update, context)
        data = client.get_summary(token, "today")
        lines = [
            "Today summary",
            f"Total: {_format_amount(data['total_spent'])}",
            f"Average/day: {_format_amount(data['daily_average'])}",
        ]
        if data["top_category"]:
            lines.append(f"Top category: {data['top_category']}")
        await query.message.reply_text("\n".join(lines))


class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path not in {"/", "/health"}:
            self.send_response(404)
            self.end_headers()
            return
        body = b"TrackIt bot is running\n"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        logger.info("health server: " + format, *args)


def start_health_server():
    port = int(os.getenv("PORT", "10000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), HealthHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    logger.info("Health server listening on port %s", port)
    return server


def main():
    if not BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN not set")
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("add", add))
    app.add_handler(CommandHandler("quick", quick))
    app.add_handler(CommandHandler("today", today))
    app.add_handler(CommandHandler("week", week))
    app.add_handler(CommandHandler("month", month))
    app.add_handler(CommandHandler("categories", categories))
    app.add_handler(CommandHandler("budget", budget))
    app.add_handler(CommandHandler("delete", delete))
    app.add_handler(CommandHandler("edit", edit))
    app.add_handler(CommandHandler("report", report))
    app.add_handler(CommandHandler("export", export))
    app.add_handler(CommandHandler("link", link))
    app.add_handler(CallbackQueryHandler(handle_callback))

    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))
    app.add_handler(MessageHandler(filters.COMMAND, unknown))

    webhook_url = os.getenv("BOT_WEBHOOK_URL", "").strip()
    if webhook_url:
        parsed_url = urlparse(webhook_url)
        url_path = parsed_url.path.strip("/") or "webhook"
        port = int(os.getenv("PORT", "10000"))
        logger.info("Starting bot in webhook mode at %s", webhook_url)
        app.run_webhook(
            listen="0.0.0.0",
            port=port,
            url_path=url_path,
            webhook_url=webhook_url,
            drop_pending_updates=True,
        )
    else:
        start_health_server()
        logger.info("Starting bot in polling mode")
        app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
