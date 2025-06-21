from pydantic import BaseModel


class SignInSchema(BaseModel):
    email: str
    password: str