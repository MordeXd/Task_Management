def test_health(client):
  res = client.get("/api/health")
  assert res.status_code == 200
  assert res.get_json()["status"] == "ok"


def test_login_success(client, super_admin):
  user, _ = super_admin
  res = client.post("/api/auth/login", json={"email": "super@test.com", "password": "Password123!"})
  assert res.status_code == 200
  data = res.get_json()
  assert "access_token" in data
  assert data["user"]["email"] == "super@test.com"


def test_login_failure(client, super_admin):
  res = client.post("/api/auth/login", json={"email": "super@test.com", "password": "wrong"})
  assert res.status_code == 401
