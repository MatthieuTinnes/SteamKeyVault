from django.test import TestCase

from users.api import validate_password_strength


class ValidatePasswordStrengthTest(TestCase):
    def test_valid_password(self):
        ok, msg = validate_password_strength("MyStr0ng!Pass")
        self.assertTrue(ok)
        self.assertEqual(msg, "")

    def test_too_short(self):
        ok, msg = validate_password_strength("Ab1!short")
        self.assertFalse(ok)
        self.assertEqual(msg, "password_min_length")

    def test_no_lowercase(self):
        ok, msg = validate_password_strength("MYSTR0NG!PASS")
        self.assertFalse(ok)
        self.assertEqual(msg, "password_lowercase")

    def test_no_uppercase(self):
        ok, msg = validate_password_strength("mystr0ng!pass")
        self.assertFalse(ok)
        self.assertEqual(msg, "password_uppercase")

    def test_no_digit(self):
        ok, msg = validate_password_strength("MyStrong!Pass!")
        self.assertFalse(ok)
        self.assertEqual(msg, "password_digit")

    def test_no_special(self):
        ok, msg = validate_password_strength("MyStr0ngPass12")
        self.assertFalse(ok)
        self.assertEqual(msg, "password_special")

    def test_all_special_chars_accepted(self):
        specials = "#?!@$%^&*-'+()_[]"
        for char in specials:
            ok, msg = validate_password_strength(f"MyStr0ngPass{char}")
            self.assertTrue(ok, f"Special char '{char}' should be accepted")
