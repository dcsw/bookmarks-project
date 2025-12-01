import io
import json
import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
    assert "status" in data, "Response JSON should contain 'status'"
    assert "received_bytes" in data, "Response JSON should contain 'received_bytes'"

    # Validate the values
    assert data["status"] == "success"
    assert data["received_bytes"] == len(file_content)

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
