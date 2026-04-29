import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=_env_path)

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
