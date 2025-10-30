# ================================
# Stage: Development
# ================================
FROM python:3.13.3-slim AS dev

# avoid buffering standard output (logs will be shown immediately)
ENV PYTHONUNBUFFERED=1

# create working directory
WORKDIR /app

# copy requirements file to workid
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy application code (after installing packages)
COPY . .

# make entrypoint file executable
RUN chmod +x entrypoint.sh

# expose port of django
EXPOSE 8000

# make migrations and start server
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
ENTRYPOINT ["sh", "./entrypoint.sh"]


# ================================
# Stage: Production
# ================================
FROM --platform=linux/amd64 python:3.13.3-slim AS prod

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies just in case (optional if psycopg2-binary is used)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x entrypoint.prd.sh

EXPOSE 8000

ENTRYPOINT ["sh", "./entrypoint.prd.sh"]
