def test_create_folder(client, auth_headers):
    resp = client.post("/folders", json={"name": "Principal"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Principal"

def test_list_folders(client, auth_headers):
    client.post("/folders", json={"name": "A"}, headers=auth_headers)
    client.post("/folders", json={"name": "B"}, headers=auth_headers)
    resp = client.get("/folders", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2

def test_nested_folders(client, auth_headers):
    parent = client.post("/folders", json={"name": "Pai"}, headers=auth_headers).json()
    child = client.post("/folders", json={"name": "Filho", "parent_id": parent["id"]}, headers=auth_headers).json()
    assert child["parent_id"] == parent["id"]

def test_folder_tree(client, auth_headers):
    parent = client.post("/folders", json={"name": "Pai"}, headers=auth_headers).json()
    client.post("/folders", json={"name": "Filho", "parent_id": parent["id"]}, headers=auth_headers)
    resp = client.get("/folders/tree", headers=auth_headers)
    assert resp.status_code == 200
    tree = resp.json()
    assert len(tree) == 1
    assert len(tree[0]["children"]) == 1

def test_delete_folder(client, auth_headers):
    folder = client.post("/folders", json={"name": "Del"}, headers=auth_headers).json()
    resp = client.delete(f"/folders/{folder['id']}", headers=auth_headers)
    assert resp.status_code == 200
    resp = client.get("/folders", headers=auth_headers)
    assert len(resp.json()) == 0

def test_cannot_access_other_user_folder(client):
    # User 1
    client.post("/auth/register", json={"email": "u1@t.com", "password": "123456"})
    t1 = client.post("/auth/login", data={"username": "u1@t.com", "password": "123456"}).json()["access_token"]
    h1 = {"Authorization": f"Bearer {t1}"}
    f = client.post("/folders", json={"name": "Private"}, headers=h1).json()

    # User 2
    client.post("/auth/register", json={"email": "u2@t.com", "password": "123456"})
    t2 = client.post("/auth/login", data={"username": "u2@t.com", "password": "123456"}).json()["access_token"]
    h2 = {"Authorization": f"Bearer {t2}"}

    resp = client.get(f"/folders/{f['id']}", headers=h2)
    assert resp.status_code == 404
