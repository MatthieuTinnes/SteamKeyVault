from django.test import TestCase, Client
from django.contrib.auth import get_user_model

User = get_user_model()


class UserAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@x.com',
            password='MyStr0ng!Pass',
            wrapped_mk_password='wrapped',
            wrapped_mk_recovery='recovery',
            mk_salt='salt',
            rk_salt='rk_salt',
            kdf_iterations=310000,
            kdf_hash='SHA-256',
        )

    def test_get_csrf_token(self):
        resp = self.client.get('/api/users/set-csrf-token')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('csrftoken', resp.json())

    def test_login_success(self):
        resp = self.client.post(
            '/api/users/login',
            data={'email': 'api@x.com', 'password': 'MyStr0ng!Pass'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get('success'))
        self.assertEqual(data['wrapped_mk_password'], 'wrapped')

    def test_login_wrong_password(self):
        resp = self.client.post(
            '/api/users/login',
            data={'email': 'api@x.com', 'password': 'WrongPassword1!'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 403)

    def test_login_nonexistent_email(self):
        resp = self.client.post(
            '/api/users/login',
            data={'email': 'noone@x.com', 'password': 'Whatever123!'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 403)

    def test_get_user_authenticated(self):
        self.client.force_login(self.user)
        resp = self.client.get('/api/users/user')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['username'], 'apiuser')
        self.assertEqual(data['email'], 'api@x.com')

    def test_get_user_unauthenticated(self):
        resp = self.client.get('/api/users/user')
        self.assertEqual(resp.status_code, 401)

    def test_logout(self):
        self.client.force_login(self.user)
        resp = self.client.post('/api/users/logout')
        self.assertEqual(resp.status_code, 200)
        # Verify logged out
        resp2 = self.client.get('/api/users/user')
        self.assertEqual(resp2.status_code, 401)

    def test_register_success(self):
        resp = self.client.post(
            '/api/users/register',
            data={
                'email': 'new@example.com',
                'username': 'newuser',
                'password': 'MyStr0ng!Pass',
                'wrapped_mk_password': 'wmk',
                'wrapped_mk_recovery': 'wmr',
                'mk_salt': 'ms',
                'rk_salt': 'rs',
                'kdf_iterations': 310000,
                'kdf_hash': 'SHA-256',
            },
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(User.objects.filter(email='new@example.com').exists())

    def test_register_duplicate_email(self):
        resp = self.client.post(
            '/api/users/register',
            data={
                'email': 'api@x.com',
                'username': 'anotheruser',
                'password': 'MyStr0ng!Pass',
                'wrapped_mk_password': 'w',
                'wrapped_mk_recovery': 'r',
                'mk_salt': 's',
                'rk_salt': 'rs',
                'kdf_iterations': 310000,
                'kdf_hash': 'SHA-256',
            },
            content_type='application/json',
        )
        self.assertIn(resp.status_code, [400, 409])

    def test_register_weak_password(self):
        resp = self.client.post(
            '/api/users/register',
            data={
                'email': 'weak@example.com',
                'username': 'weakuser',
                'password': 'short',
                'wrapped_mk_password': 'w',
                'wrapped_mk_recovery': 'r',
                'mk_salt': 's',
                'rk_salt': 'rs',
                'kdf_iterations': 310000,
                'kdf_hash': 'SHA-256',
            },
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_update_preferences(self):
        self.client.force_login(self.user)
        resp = self.client.put(
            '/api/users/preferences',
            data={'preferred_language': 'fr'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.preferred_language, 'fr')

    def test_user_stats(self):
        self.client.force_login(self.user)
        resp = self.client.get('/api/users/stats')
        self.assertEqual(resp.status_code, 200)
