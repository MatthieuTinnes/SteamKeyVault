from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model

from users.action_logging import log_user_action
from users.models import UserActionLog

User = get_user_model()


class ActionLoggingTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='logger', email='log@x.com', password='Pass123!@abc')
        self.factory = RequestFactory()

    def test_log_user_action_creates_entry(self):
        request = self.factory.get('/')
        request.META['HTTP_USER_AGENT'] = 'TestAgent/1.0'
        request.META['HTTP_X_FORWARDED_FOR'] = '1.2.3.4, 5.6.7.8'

        log_user_action(UserActionLog.ACTION_LOGIN, self.user, request)

        log = UserActionLog.objects.get(user=self.user)
        self.assertEqual(log.action_type, 'login')
        self.assertEqual(log.ip_address, '1.2.3.4')
        self.assertEqual(log.user_agent, 'TestAgent/1.0')

    def test_log_user_action_without_forwarded_for(self):
        request = self.factory.get('/')
        request.META['HTTP_USER_AGENT'] = 'Bot/2.0'

        log_user_action(UserActionLog.ACTION_REGISTER, self.user, request)

        log = UserActionLog.objects.get(user=self.user)
        self.assertIsNone(log.ip_address)

    def test_log_user_action_with_metadata(self):
        request = self.factory.get('/')
        request.META['HTTP_X_FORWARDED_FOR'] = '10.0.0.1'

        log_user_action(UserActionLog.ACTION_EMAIL_CHANGE, self.user, request, metadata={'old_email': 'a@x.com'})

        log = UserActionLog.objects.get(user=self.user)
        self.assertEqual(log.metadata, {'old_email': 'a@x.com'})

    def test_log_user_action_str(self):
        request = self.factory.get('/')
        request.META['HTTP_X_FORWARDED_FOR'] = '10.0.0.1'
        log_user_action(UserActionLog.ACTION_LOGIN, self.user, request)

        log = UserActionLog.objects.get(user=self.user)
        self.assertIn('login', str(log))
