def test_register(client):
    resp = client.post("/auth/register", json={"email": "a@b.com", "password": "123456"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "a@b.com"
    assert "id" in data

def test_register_duplicate(client):
    client.post("/auth/register", json={"email": "a@b.com", "password": "123456"})
    resp = client.post("/auth/register", json={"email": "a@b.com", "password": "123456"})
    assert resp.status_code == 400

def test_login_success(client):
    client.post("/auth/register", json={"email": "a@b.com", "password": "123456"})
    resp = client.post("/auth/login", data={"username": "a@b.com", "password": "123456"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()

def test_login_wrong_password(client):
    client.post("/auth/register", json={"email": "a@b.com", "password": "123456"})
    resp = client.post("/auth/login", data={"username": "a@b.com", "password": "wrong"})
    assert resp.status_code == 401

def test_me_authenticated(client, auth_headers):
    resp = client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"

def test_me_unauthenticated(client):
    resp = client.get("/auth/me")
    assert resp.status_code == 403
