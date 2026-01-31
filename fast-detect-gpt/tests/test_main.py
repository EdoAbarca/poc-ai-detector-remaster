import pytest
from app.main import app


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_detect_endpoint_exists(client):
    """Test that the detect endpoint responds."""
    response = client.get("/fast-detect-gpt/detect")
    # GET request should return method not allowed or similar
    assert response.status_code in [200, 405]


def test_detect_endpoint_missing_text(client):
    """Test that the detect endpoint requires text."""
    response = client.post("/fast-detect-gpt/detect", json={})
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data
    assert data["error"] == "No text provided"


def test_app_is_flask_instance():
    """Test that app is a Flask instance."""
    from flask import Flask

    assert isinstance(app, Flask)
