#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/taskflow}"
FRONTEND_DEST="${FRONTEND_DEST:-/var/www/taskflow/frontend}"

cd "$APP_DIR"
git pull origin main || git pull

cd backend
source venv/bin/activate
pip install -r requirements.txt
python seed.py

cd ../frontend
npm ci
npm run build
sudo mkdir -p "$FRONTEND_DEST"
sudo rsync -a --delete dist/ "$FRONTEND_DEST/"

sudo systemctl restart taskflow-api
sudo systemctl restart taskflow-celery
sudo systemctl reload nginx

curl -sf http://127.0.0.1:5000/api/health && echo " — API healthy"
