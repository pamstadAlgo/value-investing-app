#!/bin/sh
set -e  # Exit immediately if a command fails

echo "Running Django migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn server..."
# Adjust workers according to CPU cores if you want
exec gunicorn --workers 3 --bind 0.0.0.0:8000 valueinvesting.wsgi:application