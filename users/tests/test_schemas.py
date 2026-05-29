from django.test import TestCase
from pydantic import ValidationError

from users.schemas import SignUpSchema, SignInSchema, KDF_HASH_ALLOWED, KDF_ITERATIONS_MIN, KDF_ITERATIONS_MAX


class SignInSchemaTest(TestCase):
    def test_valid_signin(self):
        schema = SignInSchema(email='a@b.com', password='secret')
        self.assertEqual(schema.email, 'a@b.com')
        self.assertEqual(schema.password, 'secret')


class SignUpSchemaTest(TestCase):
    def _valid_payload(self, **overrides):
        data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'StrongPass1!@',
            'wrapped_mk_password': 'w',
            'wrapped_mk_recovery': 'r',
            'mk_salt': 's',
            'rk_salt': 'rs',
            'kdf_iterations': 310000,
            'kdf_hash': 'SHA-256',
        }
        data.update(overrides)
        return data

    def test_valid_signup(self):
        schema = SignUpSchema(**self._valid_payload())
        self.assertEqual(schema.email, 'test@example.com')
        self.assertEqual(schema.kdf_hash, 'SHA-256')

    def test_invalid_kdf_hash(self):
        with self.assertRaises(ValidationError):
            SignUpSchema(**self._valid_payload(kdf_hash='MD5'))

    def test_kdf_iterations_too_low(self):
        with self.assertRaises(ValidationError):
            SignUpSchema(**self._valid_payload(kdf_iterations=1000))

    def test_kdf_iterations_too_high(self):
        with self.assertRaises(ValidationError):
            SignUpSchema(**self._valid_payload(kdf_iterations=99_000_000))

    def test_allowed_kdf_hashes(self):
        for h in KDF_HASH_ALLOWED:
            schema = SignUpSchema(**self._valid_payload(kdf_hash=h))
            self.assertEqual(schema.kdf_hash, h)
