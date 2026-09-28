FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends     build-essential     libpq-dev     && rm -rf /var/lib/apt-lists/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend
COPY data /app/data

ENV PYTHONPATH=/app

CMD ["sh", "-c", "python -m backend.app.db.seed && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"]
