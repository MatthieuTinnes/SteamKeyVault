from django.test import TestCase, RequestFactory

from steamkeyvault.utils.i18n import get_request_locale, translate_message, normalize_locale


class GetRequestLocaleTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_returns_user_preferred_language(self):
        request = self.factory.get('/')

        class FakeUser:
            preferred_language = 'fr'

        locale = get_request_locale(request, user=FakeUser())
        self.assertEqual(locale, 'fr')

    def test_returns_accept_language_header(self):
        request = self.factory.get('/', HTTP_ACCEPT_LANGUAGE='fr-FR,fr;q=0.9,en;q=0.8')
        locale = get_request_locale(request)
        self.assertEqual(locale, 'fr')

    def test_returns_fallback_for_unsupported_locale(self):
        request = self.factory.get('/', HTTP_ACCEPT_LANGUAGE='de-DE')
        locale = get_request_locale(request)
        self.assertEqual(locale, 'en')

    def test_returns_fallback_when_no_header(self):
        request = self.factory.get('/')
        locale = get_request_locale(request)
        self.assertEqual(locale, 'en')

    def test_user_language_takes_precedence(self):
        request = self.factory.get('/', HTTP_ACCEPT_LANGUAGE='en-US')

        class FakeUser:
            preferred_language = 'fr'

        locale = get_request_locale(request, user=FakeUser())
        self.assertEqual(locale, 'fr')

    def test_ignores_user_with_unsupported_language(self):
        request = self.factory.get('/', HTTP_ACCEPT_LANGUAGE='fr')

        class FakeUser:
            preferred_language = 'de'

        locale = get_request_locale(request, user=FakeUser())
        self.assertEqual(locale, 'fr')


class TranslateMessageTest(TestCase):
    def test_returns_translated_message(self):
        messages = {
            'hello': {'en': 'Hello', 'fr': 'Bonjour'},
        }
        self.assertEqual(translate_message(messages, 'hello', 'fr'), 'Bonjour')

    def test_falls_back_to_english(self):
        messages = {
            'hello': {'en': 'Hello'},
        }
        self.assertEqual(translate_message(messages, 'hello', 'de'), 'Hello')

    def test_returns_key_when_missing(self):
        messages = {}
        self.assertEqual(translate_message(messages, 'missing_key', 'en'), 'missing_key')


class NormalizeLocaleTest(TestCase):
    def test_supported_locale(self):
        self.assertEqual(normalize_locale('fr'), 'fr')
        self.assertEqual(normalize_locale('en'), 'en')

    def test_unsupported_locale(self):
        self.assertEqual(normalize_locale('de'), 'en')

    def test_none_returns_fallback(self):
        self.assertEqual(normalize_locale(None), 'en')

    def test_custom_fallback(self):
        self.assertEqual(normalize_locale('de', fallback='fr'), 'fr')
