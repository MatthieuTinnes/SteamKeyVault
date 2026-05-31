from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.utils import timezone

from steamkeyvault.games.models import UserGame
from steamkeyvault.keys.models import Key
from users.models import UserActionLog

User = get_user_model()


class AdminAPITestBase(TestCase):
    """Base class with helpers for admin API tests."""

    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='MyStr0ng!Pass',
            is_admin=True,
            email_verified=True,
            wrapped_mk_password='wrapped',
            wrapped_mk_recovery='recovery',
            mk_salt='salt',
            rk_salt='rk_salt',
            kdf_iterations=310000,
            kdf_hash='SHA-256',
        )
        self.regular_user = User.objects.create_user(
            username='regular',
            email='regular@test.com',
            password='MyStr0ng!Pass',
            email_verified=True,
            wrapped_mk_password='wrapped',
            wrapped_mk_recovery='recovery',
            mk_salt='salt',
            rk_salt='rk_salt',
            kdf_iterations=310000,
            kdf_hash='SHA-256',
        )

    def admin_login(self):
        self.client.force_login(self.admin)

    def regular_login(self):
        self.client.force_login(self.regular_user)


class ListUsersTest(AdminAPITestBase):

    def test_unauthenticated(self):
        resp = self.client.get('/api/admin/users')
        self.assertEqual(resp.status_code, 401)

    def test_non_admin_forbidden(self):
        self.regular_login()
        resp = self.client.get('/api/admin/users')
        self.assertEqual(resp.status_code, 403)

    def test_list_users_returns_all_fields(self):
        self.admin_login()
        # Set last_login on regular user
        self.regular_user.last_login = timezone.now()
        self.regular_user.save(update_fields=['last_login'])

        resp = self.client.get('/api/admin/users')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('users', data)
        self.assertIn('total', data)
        self.assertEqual(data['total'], 2)

        user_emails = {u['email'] for u in data['users']}
        self.assertIn('admin@test.com', user_emails)
        self.assertIn('regular@test.com', user_emails)

        # Verify expected fields on each user
        expected_fields = {
            'id', 'username', 'email', 'email_verified', 'is_admin',
            'date_joined', 'last_login', 'games_count', 'keys_count',
        }
        for user in data['users']:
            self.assertEqual(set(user.keys()), expected_fields)

    def test_last_login_null_when_never_logged_in(self):
        self.admin_login()
        # Ensure regular_user has no last_login
        self.regular_user.last_login = None
        self.regular_user.save(update_fields=['last_login'])

        resp = self.client.get('/api/admin/users')
        data = resp.json()
        regular = next(u for u in data['users'] if u['email'] == 'regular@test.com')
        self.assertIsNone(regular['last_login'])

    def test_last_login_present_when_set(self):
        self.admin_login()
        now = timezone.now()
        self.regular_user.last_login = now
        self.regular_user.save(update_fields=['last_login'])

        resp = self.client.get('/api/admin/users')
        data = resp.json()
        regular = next(u for u in data['users'] if u['email'] == 'regular@test.com')
        self.assertIsNotNone(regular['last_login'])
        self.assertIn(now.strftime('%Y-%m-%d'), regular['last_login'])

    def test_pagination(self):
        self.admin_login()
        resp = self.client.get('/api/admin/users', {'limit': 1, 'offset': 0})
        data = resp.json()
        self.assertEqual(len(data['users']), 1)
        self.assertEqual(data['total'], 2)

    def test_search_filter(self):
        self.admin_login()
        resp = self.client.get('/api/admin/users', {'search': 'regular'})
        data = resp.json()
        self.assertEqual(data['total'], 1)
        self.assertEqual(data['users'][0]['username'], 'regular')

    def test_games_and_keys_counts(self):
        self.admin_login()
        game = UserGame.objects.create(user=self.regular_user, name='Test Game')
        Key.objects.create(key='KEY-1', userGame=game)
        Key.objects.create(key='KEY-2', userGame=game)

        resp = self.client.get('/api/admin/users')
        data = resp.json()
        regular = next(u for u in data['users'] if u['email'] == 'regular@test.com')
        self.assertEqual(regular['games_count'], 1)
        self.assertEqual(regular['keys_count'], 2)


class GetUserDetailsTest(AdminAPITestBase):

    def test_unauthenticated(self):
        resp = self.client.get(f'/api/admin/users/{self.regular_user.id}')
        self.assertEqual(resp.status_code, 401)

    def test_non_admin_forbidden(self):
        self.regular_login()
        resp = self.client.get(f'/api/admin/users/{self.regular_user.id}')
        self.assertEqual(resp.status_code, 403)

    def test_get_user_details(self):
        self.admin_login()
        now = timezone.now()
        self.regular_user.last_login = now
        self.regular_user.save(update_fields=['last_login'])

        resp = self.client.get(f'/api/admin/users/{self.regular_user.id}')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['email'], 'regular@test.com')
        self.assertIsNotNone(data['last_login'])
        self.assertIn('games_count', data)
        self.assertIn('keys_count', data)

    def test_get_user_details_null_last_login(self):
        self.admin_login()
        self.regular_user.last_login = None
        self.regular_user.save(update_fields=['last_login'])

        resp = self.client.get(f'/api/admin/users/{self.regular_user.id}')
        data = resp.json()
        self.assertIsNone(data['last_login'])

    def test_user_not_found(self):
        self.admin_login()
        resp = self.client.get('/api/admin/users/99999')
        self.assertEqual(resp.status_code, 404)


class UpdateUserEmailTest(AdminAPITestBase):

    def test_update_email(self):
        self.admin_login()
        resp = self.client.put(
            f'/api/admin/users/{self.regular_user.id}/email',
            data={'email': 'newemail@test.com'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.email, 'newemail@test.com')
        self.assertFalse(self.regular_user.email_verified)

    def test_update_email_duplicate(self):
        self.admin_login()
        resp = self.client.put(
            f'/api/admin/users/{self.regular_user.id}/email',
            data={'email': 'admin@test.com'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_update_email_user_not_found(self):
        self.admin_login()
        resp = self.client.put(
            '/api/admin/users/99999/email',
            data={'email': 'x@test.com'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 404)


class UpdateUserPasswordTest(AdminAPITestBase):

    def test_update_password(self):
        self.admin_login()
        resp = self.client.put(
            f'/api/admin/users/{self.regular_user.id}/password',
            data={'password': 'NewStr0ng!Pass9'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.regular_user.refresh_from_db()
        self.assertTrue(self.regular_user.check_password('NewStr0ng!Pass9'))

    def test_update_password_weak(self):
        self.admin_login()
        resp = self.client.put(
            f'/api/admin/users/{self.regular_user.id}/password',
            data={'password': 'weak'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_update_password_user_not_found(self):
        self.admin_login()
        resp = self.client.put(
            '/api/admin/users/99999/password',
            data={'password': 'NewStr0ng!Pass9'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 404)


class UpdateUserAdminStatusTest(AdminAPITestBase):

    def test_promote_user(self):
        self.admin_login()
        resp = self.client.put(
            f'/api/admin/users/{self.regular_user.id}/admin',
            data={'is_admin': True},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.regular_user.refresh_from_db()
        self.assertTrue(self.regular_user.is_admin)

    def test_demote_user(self):
        self.admin_login()
        other_admin = User.objects.create_user(
            username='admin2', email='admin2@test.com', password='MyStr0ng!Pass',
            is_admin=True, wrapped_mk_password='w', wrapped_mk_recovery='r',
            mk_salt='s', rk_salt='rs', kdf_iterations=310000, kdf_hash='SHA-256',
        )
        resp = self.client.put(
            f'/api/admin/users/{other_admin.id}/admin',
            data={'is_admin': False},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        other_admin.refresh_from_db()
        self.assertFalse(other_admin.is_admin)

    def test_cannot_self_demote(self):
        self.admin_login()
        resp = self.client.put(
            f'/api/admin/users/{self.admin.id}/admin',
            data={'is_admin': False},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_user_not_found(self):
        self.admin_login()
        resp = self.client.put(
            '/api/admin/users/99999/admin',
            data={'is_admin': True},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 404)


class DeleteUserTest(AdminAPITestBase):

    def test_delete_user(self):
        self.admin_login()
        user_id = self.regular_user.id
        resp = self.client.delete(f'/api/admin/users/{user_id}')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(User.objects.filter(id=user_id).exists())

    def test_cannot_self_delete(self):
        self.admin_login()
        resp = self.client.delete(f'/api/admin/users/{self.admin.id}')
        self.assertEqual(resp.status_code, 400)

    def test_user_not_found(self):
        self.admin_login()
        resp = self.client.delete('/api/admin/users/99999')
        self.assertEqual(resp.status_code, 404)


class DeleteUserGamesAndKeysTest(AdminAPITestBase):

    def test_clear_games_and_keys(self):
        self.admin_login()
        game = UserGame.objects.create(user=self.regular_user, name='Game')
        Key.objects.create(key='K1', userGame=game)

        resp = self.client.delete(f'/api/admin/users/{self.regular_user.id}/games-keys')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['deleted_games'], 1)
        self.assertEqual(data['deleted_keys'], 1)
        self.assertEqual(UserGame.objects.filter(user=self.regular_user).count(), 0)

    def test_user_not_found(self):
        self.admin_login()
        resp = self.client.delete('/api/admin/users/99999/games-keys')
        self.assertEqual(resp.status_code, 404)


class AdminStatsTest(AdminAPITestBase):

    def test_get_stats(self):
        self.admin_login()
        resp = self.client.get('/api/admin/stats')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['total_users'], 2)
        self.assertIn('verified_users', data)
        self.assertIn('admin_users', data)
        self.assertIn('total_games', data)
        self.assertIn('total_keys', data)

    def test_non_admin_forbidden(self):
        self.regular_login()
        resp = self.client.get('/api/admin/stats')
        self.assertEqual(resp.status_code, 403)


class ActionLogsTest(AdminAPITestBase):

    def setUp(self):
        super().setUp()
        UserActionLog.objects.create(
            user=self.regular_user,
            action_type=UserActionLog.ACTION_LOGIN,
            ip_address='127.0.0.1',
            user_agent='test-agent',
        )

    def test_list_action_logs(self):
        self.admin_login()
        resp = self.client.get('/api/admin/action-logs')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('logs', data)
        self.assertIn('total', data)
        self.assertEqual(data['total'], 1)
        log = data['logs'][0]
        self.assertEqual(log['action_type'], 'login')
        self.assertEqual(log['username'], 'regular')

    def test_action_logs_filter_by_type(self):
        self.admin_login()
        resp = self.client.get('/api/admin/action-logs', {'action_type': 'register'})
        data = resp.json()
        self.assertEqual(data['total'], 0)

    def test_action_logs_filter_by_user(self):
        self.admin_login()
        resp = self.client.get('/api/admin/action-logs', {'user_query': 'regular'})
        data = resp.json()
        self.assertEqual(data['total'], 1)

    def test_action_log_stats(self):
        self.admin_login()
        resp = self.client.get('/api/admin/action-logs/stats')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['total_actions'], 1)
        self.assertEqual(data['logins'], 1)
        self.assertEqual(data['registrations'], 0)

    def test_non_admin_forbidden(self):
        self.regular_login()
        resp = self.client.get('/api/admin/action-logs')
        self.assertEqual(resp.status_code, 403)
