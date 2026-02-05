from pydantic import BaseModel


class SignInSchema(BaseModel):
    email: str
    password: str
class SignUpSchema(BaseModel):
    email: str
    username: str
    password: str
    wrapped_mk_password: str
    wrapped_mk_recovery: str
    mk_salt: str
    rk_salt: str
    kdf_iterations: int
    kdf_hash: str
class UpdateEmailSchema(BaseModel):
    email: str


class RecoveryInfoSchema(BaseModel):
    email: str


class ForgotPasswordSchema(BaseModel):
    email: str


class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str
    wrapped_mk_password: str


class ChangePasswordSchema(BaseModel):
    current_password: str
    new_password: str
    wrapped_mk_password: str