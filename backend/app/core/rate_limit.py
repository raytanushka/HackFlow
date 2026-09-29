import time
from collections import defaultdict
from fastapi import HTTPException, status

class RateLimiter:
    """
    Lightweight in-memory sliding window rate limiter.
    Zero external dependencies, self-hostable, offline-compatible.
    """
    def __init__(self, limit: int = 20, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self.history = defaultdict(list)

    def check(self, key: str):
        now = time.time()
        # Clean up timestamps older than window
        timestamps = self.history[key]
        cutoff = now - self.window_seconds
        valid_timestamps = [t for t in timestamps if t > cutoff]
        
        if len(valid_timestamps) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: maximum {self.limit} requests per {self.window_seconds} seconds. Please wait before retrying."
            )
        
        valid_timestamps.append(now)
        self.history[key] = valid_timestamps

vote_rate_limiter = RateLimiter(limit=30, window_seconds=60)
comment_rate_limiter = RateLimiter(limit=20, window_seconds=60)
