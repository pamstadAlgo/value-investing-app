FROM python:3.13.3-slim

# avoid buffering standard output (logs will be shown immediately)
ENV PYTHONUNBUFFERED=1

# copy requirements.txt and and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#copy application code
COPY . .
