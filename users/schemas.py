from pydantic import BaseModel


class SignInSchema(BaseModel):
    email: str
    password: str
class SignUpSchema(BaseModel):
    email: str
    username: str
    password: str
class UpdateEmailSchema(BaseModel):
    email: str


class ChangePasswordSchema(BaseModel):
    current_password: str
    new_password: str