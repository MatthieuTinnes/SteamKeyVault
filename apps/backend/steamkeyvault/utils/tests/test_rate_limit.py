from django.test import TestCase, RequestFactory
from django.core.cache import cache

from steamkeyvault.utils.rate_limit import rate_limit


class RateLimitTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        cache.clear()

    def tearDown(self):
        cache.clear()

    def test_allows_requests_under_limit(self):
        @rate_limit(limit=3, window=60)
        def view(request):
            from django.http import JsonResponse
            return JsonResponse({'ok': True})

        request = self.factory.get('/')
        request.META['REMOTE_ADDR'] = '1.2.3.4'

        for _ in range(3):
            resp = view(request)
            self.assertEqual(resp.status_code, 200)

    def test_blocks_requests_over_limit(self):
        @rate_limit(limit=2, window=60)
        def view(request):
            from django.http import JsonResponse
            return JsonResponse({'ok': True})

        request = self.factory.get('/')
        request.META['REMOTE_ADDR'] = '5.6.7.8'

        view(request)
        view(request)
        resp = view(request)
        self.assertEqual(resp.status_code, 429)

    def test_different_ips_have_separate_limits(self):
        @rate_limit(limit=1, window=60)
        def view(request):
            from django.http import JsonResponse
            return JsonResponse({'ok': True})

        req1 = self.factory.get('/')
        req1.META['REMOTE_ADDR'] = '10.0.0.1'

        req2 = self.factory.get('/')
        req2.META['REMOTE_ADDR'] = '10.0.0.2'

        resp1 = view(req1)
        resp2 = view(req2)
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp2.status_code, 200)

        resp3 = view(req1)
        self.assertEqual(resp3.status_code, 429)
