import unittest
from unittest.mock import patch, MagicMock
from s3 import download_file, upload_file


class FakeClient:
    def download_file(self):
        pass

    def upload_file(self):
        pass

    def generate_presigned_url(self):
        pass


fake_client = FakeClient()
fake_client.download_file = MagicMock()
fake_client.upload_file = MagicMock()
fake_client.generate_presigned_url = MagicMock()


class TestS3Methods(unittest.TestCase):
    @patch('s3.init_client', return_value=fake_client)
    def test_download_file(self, client):
        res = download_file('bucket', 'object_name')
        self.assertEqual(res, True)
        fake_client.download_file.assert_called_once_with(
            'bucket', 'object_name', 'object_name')

    @patch('s3.init_client', return_value=fake_client)
    def test_upload_file(self, client):
        res = upload_file('file_name', 'bucket')
        self.assertEqual(res, True)
        fake_client.upload_file.assert_called_once_with(
            'file_name', 'bucket', 'file_name')


if __name__ == '__main__':
    unittest.main()
