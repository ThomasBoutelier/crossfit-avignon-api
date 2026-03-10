#!/usr/bin/env python3
"""
Script CLI autonome pour créer un utilisateur CRM.
N'a pas besoin du module 'app' — fonctionne seul sur le serveur.

Dépendances : passlib[bcrypt], psycopg2-binary
Usage:
    python create_user.py
    python create_user.py --email admin@crossfit-avignon.fr
    python create_user.py --email admin@crossfit-avignon.fr --password MonMotDePasse123
    python create_user.py --database-url "postgresql://user:pass@host/db" --email ...
"""
import argparse
import getpass
import os
import sys
import uuid
import warnings

# Supprime le warning de compatibilité passlib/bcrypt
warnings.filterwarnings("ignore", ".*error reading bcrypt version.*")

try:
    from passlib.context import CryptContext
except ImportError:
    print("❌ passlib manquant. Installe-le : pip install 'passlib[bcrypt]' bcrypt==4.0.1")
    sys.exit(1)

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2 manquant. Installe-le : pip install psycopg2-binary")
    sys.exit(1)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def get_database_url(cli_url: str | None) -> str:
    url = cli_url or os.environ.get("DATABASE_URL") or os.environ.get("database_url")
    if url:
        # SQLAlchemy prefix → psycopg2 direct
        return url.replace("postgresql+psycopg2://", "postgresql://")

    # Lecture du .env si présent
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATABASE_URL"):
                    _, _, val = line.partition("=")
                    val = val.strip().strip('"').strip("'")
                    return val.replace("postgresql+psycopg2://", "postgresql://")

    # Valeur par défaut locale
    return "postgresql://postgres:postgres@localhost:5432/crossfit_avignon"


def create_user(database_url: str, email: str, password: str) -> None:
    hashed = hash_password(password)
    user_id = str(uuid.uuid4())

    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = False
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE email = %s", (email.lower(),))
        if cur.fetchone():
            print(f"❌ Un utilisateur avec l'email '{email}' existe déjà.")
            sys.exit(1)

        cur.execute(
            """
            INSERT INTO users (id, email, hashed_password, is_active, created_at)
            VALUES (%s, %s, %s, true, now())
            """,
            (user_id, email.lower(), hashed),
        )
        conn.commit()
        print(f"✅ Utilisateur créé : {email}")

    except psycopg2.OperationalError as e:
        print(f"❌ Impossible de se connecter à la base : {e}")
        print("   Vérifie DATABASE_URL ou utilise --database-url")
        sys.exit(1)
    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur : {e}")
        sys.exit(1)
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def main() -> None:
    parser = argparse.ArgumentParser(description="Créer un utilisateur CRM")
    parser.add_argument("--email", help="Email de l'utilisateur")
    parser.add_argument("--password", help="Mot de passe (si omis, sera demandé)")
    parser.add_argument("--database-url", help="URL PostgreSQL (sinon lit DATABASE_URL ou .env)")
    args = parser.parse_args()

    database_url = get_database_url(args.database_url)

    email = args.email or input("Email : ").strip()
    if not email:
        print("❌ Email requis.")
        sys.exit(1)

    password = args.password or getpass.getpass("Mot de passe : ")
    if len(password) < 8:
        print("❌ Le mot de passe doit faire au moins 8 caractères.")
        sys.exit(1)

    create_user(database_url, email, password)


if __name__ == "__main__":
    main()
