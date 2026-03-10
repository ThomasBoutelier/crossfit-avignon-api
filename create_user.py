#!/usr/bin/env python3
"""
Script CLI pour créer un utilisateur CRM.

Usage:
    python create_user.py
    python create_user.py --email admin@crossfit-avignon.fr --password MonMotDePasse123
"""
import argparse
import getpass
import sys

# S'assurer que le module app est trouvable
sys.path.insert(0, ".")

from app.core.auth import hash_password
from app.db.session import SessionLocal
from app.models.user import User  # noqa: E402 — import après sys.path


def create_user(email: str, password: str) -> None:
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email.lower()).first()
        if existing:
            print(f"❌ Un utilisateur avec l'email '{email}' existe déjà.")
            sys.exit(1)

        user = User(
            email=email.lower(),
            hashed_password=hash_password(password),
            is_active=True,
        )
        db.add(user)
        db.commit()
        print(f"✅ Utilisateur créé : {email}")
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur : {e}")
        sys.exit(1)
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Créer un utilisateur CRM")
    parser.add_argument("--email", help="Email de l'utilisateur")
    parser.add_argument("--password", help="Mot de passe (si omis, sera demandé)")
    args = parser.parse_args()

    email = args.email or input("Email : ").strip()
    if not email:
        print("❌ Email requis.")
        sys.exit(1)

    password = args.password or getpass.getpass("Mot de passe : ")
    if len(password) < 8:
        print("❌ Le mot de passe doit faire au moins 8 caractères.")
        sys.exit(1)

    create_user(email, password)


if __name__ == "__main__":
    main()
