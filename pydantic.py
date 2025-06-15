class ValidationError(Exception):
    pass

class BaseModel:
    def __init__(self, **data):
        for field in self.__annotations__:
            if field not in data:
                raise ValidationError(f"{field} is required")
            setattr(self, field, data[field])

    def model_dump(self):
        result = {}
        for field in self.__annotations__:
            value = getattr(self, field)
            if isinstance(value, list):
                result[field] = [v.model_dump() if hasattr(v, 'model_dump') else v for v in value]
            else:
                result[field] = value.model_dump() if hasattr(value, 'model_dump') else value
        return result

    def __getitem__(self, item):
        return getattr(self, item)

def Field(default=None, description=None):
    return default
