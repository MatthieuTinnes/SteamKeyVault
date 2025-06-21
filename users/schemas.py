from pydantic import BaseModel


class SignInSchema(BaseModel):
    email: str
    password: str
class SignUpSchema(BaseModel):
    email: str
    username: str
    password: str