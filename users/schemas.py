from pydantic import BaseModel, field_validator

KDF_HASH_ALLOWED = {'SHA-256', 'SHA-512'}
KDF_ITERATIONS_MIN = 100_000
KDF_ITERATIONS_MAX = 10_000_000


class SignInSchema(BaseModel):
    email: str
    password: str

class SignUpSchema(BaseModel):
    email: str
    username: str
    password: str
    preferred_language: str | None = None
    wrapped_mk_password: str
    wrapped_mk_recovery: str
    mk_salt: str
    rk_salt: str
    kdf_iterations: int
    kdf_hash: str
    turnstile_token: str | None = None

    @field_validator('kdf_hash')
    @classmethod
    def validate_kdf_hash(cls, v: str) -> str:
        if v not in KDF_HASH_ALLOWED:
            raise ValueError(f'kdf_hash must be one of: {", ".join(sorted(KDF_HASH_ALLOWED))}')
        return v

    @field_validator('kdf_iterations')
    @classmethod
    def validate_kdf_iterations(cls, v: int) -> int:
        if v < KDF_ITERATIONS_MIN:
            raise ValueError(f'kdf_iterations must be at least {KDF_ITERATIONS_MIN}')
        if v > KDF_ITERATIONS_MAX:
            raise ValueError(f'kdf_iterations must be at most {KDF_ITERATIONS_MAX}')
        return v

class UpdateEmailSchema(BaseModel):
    email: str


class UpdatePreferencesSchema(BaseModel):
    preferred_language: str


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