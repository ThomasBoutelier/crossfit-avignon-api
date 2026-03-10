import time
from collections import defaultdict
from typing import DefaultDict, List

from fastapi import Depends, HTTPException, Request, status

from app.core.config import get_settings


_requests_store: DefaultDict[str, List[float]] = defaultdict(list)


async def rate_limiter(request: Request, settings=Depends(get_settings)) -> None:
    """
    Very simple in-memory rate limiter per IP.
    Not suitable for multi-instance production but fine for a small landing.
    """
    client_ip = request.client.host if request.client else "anonymous"
    window = settings.rate_limit_window_seconds
    max_requests = settings.rate_limit_requests

    now = time.time()
    recent = [ts for ts in _requests_store[client_ip] if now - ts < window]

    if len(recent) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de requêtes, merci de réessayer plus tard.",
        )

    recent.append(now)
    _requests_store[client_ip] = recent

