from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import (
    create_access_token,
    get_current_user,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserPublic

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Connexion — obtenir un token JWT",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Vérifie les identifiants et retourne un JWT Bearer token."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé.",
        )

    token = create_access_token(data={"sub": user.email})
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Informations sur l'utilisateur connecté",
)
def me(current_user: User = Depends(get_current_user)) -> UserPublic:
    return current_user
