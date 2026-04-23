import os
import json
import redis


class RedisCache:

    def __init__(self):
        self.client = redis.Redis(
            host=os.getenv("REDIS_HOST"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=int(os.getenv("REDIS_DB", 0)),
            decode_responses=True
        )

    def get(self, key):
        value = self.client.get(key)
        if value:
            return json.loads(value)
        return None

    def set(self, key, value, ex=60):
        self.client.set(key, json.dumps(value), ex=ex)

    def delete(self, key):
        self.client.delete(key)