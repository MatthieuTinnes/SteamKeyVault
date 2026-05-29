from django.test import TestCase

from steamkeyvault.steam.models import SteamApp


class SteamAppModelTest(TestCase):
    def test_create_steam_app(self):
        app = SteamApp.objects.create(id=220, name='Half-Life 2')
        self.assertEqual(app.id, 220)
        self.assertEqual(app.name, 'Half-Life 2')

    def test_str_representation(self):
        app = SteamApp.objects.create(id=400, name='Portal')
        self.assertEqual(str(app), 'Portal (400)')

    def test_primary_key_is_id(self):
        app = SteamApp.objects.create(id=730, name='CS2')
        self.assertEqual(SteamApp.objects.get(pk=730), app)
