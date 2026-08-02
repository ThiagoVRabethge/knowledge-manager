def test_create_note(client, auth_headers):
    resp = client.post("/notes", json={"title": "Hello", "content": "World"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Hello"

def test_create_note_in_folder(client, auth_headers):
    folder = client.post("/folders", json={"name": "Docs"}, headers=auth_headers).json()
    resp = client.post("/notes", json={"title": "In Folder", "folder_id": folder["id"]}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["folder_id"] == folder["id"]

def test_update_note(client, auth_headers):
    note = client.post("/notes", json={"title": "Old", "content": "Text"}, headers=auth_headers).json()
    resp = client.patch(f"/notes/{note['id']}", json={"title": "New"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "New"

def test_delete_note(client, auth_headers):
    note = client.post("/notes", json={"title": "Del", "content": ""}, headers=auth_headers).json()
    resp = client.delete(f"/notes/{note['id']}", headers=auth_headers)
    assert resp.status_code == 200
    resp = client.get("/notes", headers=auth_headers)
    assert len(resp.json()) == 0

def test_search_notes(client, auth_headers):
    client.post("/notes", json={"title": "Python", "content": "Programming"}, headers=auth_headers)
    client.post("/notes", json={"title": "Java", "content": "Coffee"}, headers=auth_headers)
    resp = client.get("/notes/search?q=python", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["title"] == "Python"

def test_note_isolation(client):
    client.post("/auth/register", json={"email": "u1@t.com", "password": "123456"})
    t1 = client.post("/auth/login", data={"username": "u1@t.com", "password": "123456"}).json()["access_token"]
    h1 = {"Authorization": f"Bearer {t1}"}
    note = client.post("/notes", json={"title": "Secret"}, headers=h1).json()

    client.post("/auth/register", json={"email": "u2@t.com", "password": "123456"})
    t2 = client.post("/auth/login", data={"username": "u2@t.com", "password": "123456"}).json()["access_token"]
    h2 = {"Authorization": f"Bearer {t2}"}

    resp = client.get(f"/notes/{note['id']}", headers=h2)
    assert resp.status_code == 404
