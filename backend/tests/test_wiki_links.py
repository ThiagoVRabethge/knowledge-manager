def test_wiki_links_extraction(client, auth_headers):
    # Create target note
    target = client.post("/notes", json={"title": "Target Note", "content": "content"}, headers=auth_headers).json()
    # Create source note with wiki link
    source = client.post("/notes", json={
        "title": "Source",
        "content": "See [[Target Note]] for more info."
    }, headers=auth_headers).json()

    links = client.get(f"/notes/{source['id']}/links", headers=auth_headers).json()
    assert len(links) == 1
    assert links[0]["title"] == "Target Note"

def test_wiki_links_with_brackets_in_title(client, auth_headers):
    target = client.post("/notes", json={"title": "[estrutura] teologia", "content": ""}, headers=auth_headers).json()
    source = client.post("/notes", json={
        "title": "Source",
        "content": "Link: [[[estrutura] teologia]]"
    }, headers=auth_headers).json()

    links = client.get(f"/notes/{source['id']}/links", headers=auth_headers).json()
    assert len(links) == 1
    assert links[0]["title"] == "[estrutura] teologia"

def test_backlinks(client, auth_headers):
    target = client.post("/notes", json={"title": "Main", "content": ""}, headers=auth_headers).json()
    client.post("/notes", json={
        "title": "Ref1",
        "content": "See [[Main]]"
    }, headers=auth_headers)
    client.post("/notes", json={
        "title": "Ref2",
        "content": "Also see [[Main]]"
    }, headers=auth_headers)

    backlinks = client.get(f"/notes/{target['id']}/backlinks", headers=auth_headers).json()
    assert len(backlinks) == 2

def test_no_duplicate_links(client, auth_headers):
    target = client.post("/notes", json={"title": "Dup", "content": ""}, headers=auth_headers).json()
    source = client.post("/notes", json={
        "title": "Source",
        "content": "[[Dup]] [[Dup]] [[Dup]]"
    }, headers=auth_headers).json()

    links = client.get(f"/notes/{source['id']}/links", headers=auth_headers).json()
    assert len(links) == 1
