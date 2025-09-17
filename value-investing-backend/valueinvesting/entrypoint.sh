#!/bin/sh
set -e  # Exit immediately if a command fails

echo "Running Django migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000