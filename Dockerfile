FROM python:3.11-slim

WORKDIR /app

# Dépendances système minimales pour psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code de l'application
COPY app/ ./app/

# Port exposé (uvicorn)
EXPOSE 8000

# Utilisateur non-root
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser:appuser /app
USER appuser

# Point d'entrée
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
