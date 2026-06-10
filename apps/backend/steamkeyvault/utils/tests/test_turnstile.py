from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings

from steamkeyvault.utils.turnstile import validate_turnstile


class ValidateTurnstileTest(TestCase):
    @override_settings(TURNSTILE_SECRET_KEY='', TURNSTILE_VERIFY_URL='')
    def test_returns_true_when_not_configured(self):
        result = validate_turnstile('token', '1.2.3.4')
        self.assertTrue(result)

    @override_settings(TURNSTILE_SECRET_KEY='secret', TURNSTILE_VERIFY_URL='https://verify.example.com')
    @patch('steamkeyvault.utils.turnstile.requests.post')
    def test_returns_true_on_success(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {'success': True}
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        result = validate_turnstile('valid_token', '1.2.3.4')
        self.assertTrue(result)
        mock_post.assert_called_once()

    @override_settings(TURNSTILE_SECRET_KEY='secret', TURNSTILE_VERIFY_URL='https://verify.example.com')
    @patch('steamkeyvault.utils.turnstile.requests.post')
    def test_returns_false_on_failure(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {'success': False}
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        result = validate_turnstile('bad_token', '1.2.3.4')
        self.assertFalse(result)

    @override_settings(TURNSTILE_SECRET_KEY='secret', TURNSTILE_VERIFY_URL='https://verify.example.com')
    @patch('steamkeyvault.utils.turnstile.requests.post')
    def test_returns_false_on_network_error(self, mock_post):
        mock_post.side_effect = Exception('network error')
        result = validate_turnstile('token', '1.2.3.4')
        self.assertFalse(result)

    @override_settings(TURNSTILE_SECRET_KEY='secret', TURNSTILE_VERIFY_URL='https://verify.example.com')
    @patch('steamkeyvault.utils.turnstile.requests.post')
    def test_action_mismatch(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {'success': True, 'action': 'login'}
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        result = validate_turnstile('token', '1.2.3.4', expected_action='register')
        self.assertFalse(result)

    @override_settings(TURNSTILE_SECRET_KEY='secret', TURNSTILE_VERIFY_URL='https://verify.example.com')
    @patch('steamkeyvault.utils.turnstile.requests.post')
    def test_action_match(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {'success': True, 'action': 'login'}
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        result = validate_turnstile('token', '1.2.3.4', expected_action='login')
        self.assertTrue(result)
