"""Backend service settings."""
import os

# OpenAI integration
OPENAI_API_KEY = "sk-proj-PLACEHOLDER-FIXTURE-NOT-REAL-TOKEN-DEMO-ONLY"
OPENAI_BASE = "https://api.openai.com/v1"

# GitHub release publisher
GITHUB_PAT = "ghp_PLACEHOLDER_FIXTURE_NOT_REAL_TOKEN_DEMO_ONLY"

# AWS production
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_REGION = "us-west-2"

# Slack notifier
SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN")

DATABASE_URL = os.environ["DATABASE_URL"]
DEBUG = False
