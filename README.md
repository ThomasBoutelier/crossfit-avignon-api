## CrossFit Avignon - API de leads

API FastAPI pour gérer les leads de la landing page de pré‑ouverture de la salle CrossFit Avignon.

### Stack

- **Langage**: Python 3.11+
- **Framework**: FastAPI
- **Base de données**: PostgreSQL

### Installation

1. **Cloner le repo** puis créer un environnement virtuel:

```bash
python -m venv .venv
source .venv/bin/activate  # sur macOS / Linux
# .venv\Scripts\activate   # sur Windows
```

2. **Installer les dépendances**:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

3. **Configurer PostgreSQL**:

- Créer une base, par exemple `crossfit_avignon`
- Appliquer le script SQL `postgres.txt` (en particulier les enums, tables et triggers):

```bash
psql -d crossfit_avignon -f postgres.txt
```

4. **Configurer les variables d'environnement** (optionnel):

- Copier `.env.example` vers `.env` et adapter:

```bash
cp .env.example .env
```

Les variables importantes:

- `DATABASE_URL` (optionnel, sinon défaut localhost)
- `BACKEND_CORS_ORIGINS` (si besoin d'ajouter des origines)

### Lancer l'API

Depuis la racine du projet:

```bash
uvicorn app.main:app --reload
```

L'API sera disponible sur `http://localhost:8000`.

- Documentation interactive Swagger: `http://localhost:8000/docs`
- Documentation ReDoc: `http://localhost:8000/redoc`
- Healthcheck: `GET http://localhost:8000/health`

### Endpoints principaux

- **POST** `/v1/leads/waitlist`
  - Reçoit les champs du formulaire (prenom, nom, email, téléphone, expérience, message, tracking UTM, etc.)
  - Capture automatiquement `ip_address` et `user_agent`
  - Crée un `lead` et un `lead_event` de type `created`
  - Protégé par un rate limiting très basique (par IP)

- **GET** `/health`
  - Retourne l'état de l'API et un check simple de la base (`SELECT 1`)

### Notes techniques

- Validation des données via **Pydantic** (email avec `EmailStr`)
- ORM: **SQLAlchemy 2.x**
- CORS activé pour un frontend React (configurable via settings)
- Index sur `email`, `status`, `utm_source`, `utm_campaign` (via modèle + script SQL)
- Protection contre les doublons par email (`UNIQUE(email)` + gestion d'erreur 409)

