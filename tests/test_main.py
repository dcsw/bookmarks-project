import io
import json
import pytest
from fastapi.testclient import TestClient

# Import the FastAPI app from the backend
from backend.main import app

client = TestClient(app)

def test_upload_endpoint_success():
    """
    Test that uploading a file returns a 200 response and the expected JSON structure.
    """
    # Create a simple in-memory file
    file_content = b"Hello, world!"
    file_name = "hello.txt"

    # Prepare the multipart/form-data payload
    files = {"file": (file_name, io.BytesIO(file_content), "text/plain")}

    # Send POST request to the /upload endpoint
    response = client.post("/upload", files=files)

    # Verify the response status code
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    # Verify the response JSON structure
    data = response.json()
    assert isinstance(data, dict), "Response should be a JSON object"
    assert "filename" in data, "Response JSON should contain 'filename'"
    assert "size" in data, "Response JSON should contain 'size'"
    assert "content_type" in data, "Response JSON should contain 'content_type'"

    # Validate the values
    assert data["filename"] == file_name
    assert data["size"] == len(file_content)
    assert data["content_type"] == "text/plain"

def test_upload_endpoint_no_file():
    """
    Test that sending a POST request without a file returns a 422 Unprocessable Entity error.
    """
    response = client.post("/upload", files={})
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"

def test_upload_endpoint_invalid_file_field():
    """
    Test that sending a POST request with an unexpected field name returns a 422 error.
    """
    files = {"wrong_field": ("test.txt", io.BytesIO(b"data"), "text/plain")}
    response = client.post("/upload", files=files)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
