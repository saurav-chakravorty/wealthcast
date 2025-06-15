class FastAPI:
    def __init__(self, **kwargs):
        pass

    def add_middleware(self, middleware, **kwargs):
        pass

    def get(self, path, **kwargs):
        def decorator(func):
            return func
        return decorator

    def post(self, path, **kwargs):
        def decorator(func):
            return func
        return decorator
