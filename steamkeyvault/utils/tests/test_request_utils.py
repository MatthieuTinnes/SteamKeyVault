from django.test import TestCase, RequestFactory

from steamkeyvault.utils.request_utils import read_request_file


class ReadRequestFileTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_returns_initial_bytes_if_provided(self):
        request = self.factory.get('/')
        result = read_request_file(request, initial_bytes=b'hello')
        self.assertEqual(result, b'hello')

    def test_reads_uploaded_file(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        f = SimpleUploadedFile('test.csv', b'game;key1;key2')
        request = self.factory.post('/', {'file': f})
        result = read_request_file(request)
        self.assertEqual(result, b'game;key1;key2')

    def test_returns_none_when_no_file(self):
        request = self.factory.get('/')
        result = read_request_file(request)
        self.assertIsNone(result)

    def test_fallback_body(self):
        request = self.factory.post('/', data=b'raw body', content_type='application/octet-stream')
        result = read_request_file(request, fallback_body=True)
        self.assertEqual(result, b'raw body')
