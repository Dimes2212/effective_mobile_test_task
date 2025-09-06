import request from "supertest";
import type http from "http";
import { startServer } from "../src/server";
import prisma from "../src/config/db";


let server: http.Server;

async function registerUser(
  data: { name: string; email: string; password: string },
  expectedStatus = 201
) {
  return await request(server)
    .post("/api/users/register")
    .send(data)
    .expect(expectedStatus);
}

async function loginUser(
  data: { email: string; password: string },
  expectedStatus = 200
) {
  return await request(server)
    .post("/api/users/login")
    .send(data)
    .expect(expectedStatus);
}

async function registerAndLogin(user: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "USER";
}) {
  await registerUser(user, 201);

  if (user.role === "ADMIN") {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: "ADMIN" },
    });
  }

  const res = await loginUser(
    { email: user.email, password: user.password },
    200
  );

  return res.body.token as string;
}



beforeAll(async () => {
  server = await startServer(0);
});

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

// ТЕСТЫ

describe("POST /api/users/register", () => {
  it("201 — создаёт нового пользователя", async () => {
    const res = await registerUser({
      name: "Dimes",
      email: "a@a.com",
      password: "12345678",
    });

    expect(res.body).toHaveProperty("email", "a@a.com");
    expect(res.body).toHaveProperty("name", "Dimes");
  });

  it("400 — ошибка валидации (нет password)", async () => {
    await registerUser({ name: "Li", email: "b@b.com", password: "" }, 400);
  });

  it("400 — имя слишком короткое", async () => {
    await registerUser({ name: "L", email: "c@c.com", password: "12345678" }, 400);
  });

  it("400 — невалидный email", async () => {
    await registerUser({ name: "Valid", email: "not-an-email", password: "12345678" }, 400);
  });

  it("409 — дубликат email", async () => {
    await registerUser({
      name: "Dup",
      email: "dup@example.com",
      password: "12345678",
    });

    await registerUser(
      { name: "Dup", email: "dup@example.com", password: "12345678" },
      409
    );
  });
});

describe("POST /api/users/login", () => {
  it("200 — нормальная авторизация", async () => {
    await registerUser({
      name: "User",
      email: "user@example.com",
      password: "12345678",
    });

    const res = await loginUser({
      email: "user@example.com",
      password: "12345678",
    });

    expect(res.body).toHaveProperty("token");
  });

  it("401 — неверный пароль", async () => {
    await registerUser({
      name: "User",
      email: "user2@example.com",
      password: "12345678",
    });

    await loginUser({ email: "user2@example.com", password: "wrongpass" }, 401);
  });

  it("401 — пользователь не найден", async () => {
    await loginUser({ email: "ghost@example.com", password: "12345678" }, 401);
  });

  it("400 — нет email", async () => {
    await request(server)
      .post("/api/users/login")
      .send({ password: "12345678" })
      .expect(400);
  });

  it("400 — нет password", async () => {
    await request(server)
      .post("/api/users/login")
      .send({ email: "no@example.com" })
      .expect(400);
  });

  it("400 — невалидный email", async () => {
    await request(server)
      .post("/api/users/login")
      .send({ email: "not-an-email", password: "12345678" })
      .expect(400);
  });
});

describe("GET /api/users/:email", () => {
  it("200 — админ получает любого пользователя", async () => {
    const adminToken = await registerAndLogin({
      name: "Admin",
      email: "admin@example.com",
      password: "12345678",
      role: "ADMIN",
    });
    await registerUser({
      name: "User1",
      email: "user1@example.com",
      password: "12345678",
    });

    const res = await request(server)
      .get("/api/users/user1@example.com")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty("email", "user1@example.com");
  });

  it("200 — пользователь получает себя", async () => {
    const token = await registerAndLogin({
      name: "Self",
      email: "self@example.com",
      password: "12345678",
    });

    const res = await request(server)
      .get("/api/users/self@example.com")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty("email", "self@example.com");
  });

  it("403 — пользователь получает чужого", async () => {
    const tokenA = await registerAndLogin({
      name: "UserA",
      email: "a@example.com",
      password: "12345678",
    });
    await registerUser({
      name: "UserB",
      email: "b@example.com",
      password: "12345678",
    });

    await request(server)
      .get("/api/users/b@example.com")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(403);
  });

  it("401 — без токена", async () => {
    await registerUser({
      name: "NoAuth",
      email: "noauth@example.com",
      password: "12345678",
    });

    await request(server)
      .get("/api/users/noauth@example.com")
      .expect(401);
  });

  it("401 — невалидный токен", async () => {
    await registerUser({
      name: "Bad",
      email: "bad@example.com",
      password: "12345678",
    });

    await request(server)
      .get("/api/users/bad@example.com")
      .set("Authorization", "Bearer invalid.jwt")
      .expect(401);
  });

  it("404 — пользователь не найден (для админа)", async () => {
    const adminToken = await registerAndLogin({
      name: "Root",
      email: "root@example.com",
      password: "12345678",
      role: "ADMIN",
    });

    await request(server)
      .get("/api/users/missing@example.com")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);
  });

  it("400 — невалидный email в params", async () => {
    const adminToken = await registerAndLogin({
      name: "Admin2",
      email: "admin2@example.com",
      password: "12345678",
      role: "ADMIN",
    });

    await request(server)
      .get("/api/users/not-an-email")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);
  });
});

describe("GET /api/users", () => {
  it("200 — админ получает список пользователей", async () => {
    const adminToken = await registerAndLogin({
      name: "Admin",
      email: "adminlist@example.com",
      password: "12345678",
      role: "ADMIN",
    });
    await registerUser({
      name: "UserX",
      email: "ux@example.com",
      password: "12345678",
    });

    const res = await request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty("users");
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it("403 — обычный пользователь получает список", async () => {
    const token = await registerAndLogin({
      name: "UserY",
      email: "uy@example.com",
      password: "12345678",
    });

    await request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });

  it("401 — без токена", async () => {
    await request(server).get("/api/users").expect(401);
  });
});

describe("PATCH /api/users/:email/ban", () => {
  it("200 — админ банит пользователя", async () => {
    const adminToken = await registerAndLogin({
      name: "Admin",
      email: "adminban@example.com",
      password: "12345678",
      role: "ADMIN",
    });
    await registerUser({
      name: "Victim",
      email: "victim@example.com",
      password: "12345678",
    });

    const res = await request(server)
      .patch("/api/users/victim@example.com/ban")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty("status", "BLOCKED");
  });

  it("403 — пользователь пытается банить чужого", async () => {
    const tokenA = await registerAndLogin({
      name: "UserA",
      email: "a2@example.com",
      password: "12345678",
    });
    await registerUser({
      name: "UserB",
      email: "b2@example.com",
      password: "12345678",
    });

    await request(server)
      .patch("/api/users/b2@example.com/ban")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(403);
  });

  it("200 — пользователь может банить сам себя (по коду)", async () => {
    const token = await registerAndLogin({
      name: "SelfBan",
      email: "selfban@example.com",
      password: "12345678",
    });

    const res = await request(server)
      .patch("/api/users/selfban@example.com/ban")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(["ACTIVE", "BLOCKED"]).toContain(res.body.status);
  });

  it("401 — без токена", async () => {
    await request(server)
      .patch("/api/users/ghost@example.com/ban")
      .expect(401);
  });

  it("400 — невалидный email в params", async () => {
    const adminToken = await registerAndLogin({
      name: "AdminBan2",
      email: "adminban2@example.com",
      password: "12345678",
      role: "ADMIN",
    });

    await request(server)
      .patch("/api/users/not-an-email/ban")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);
  });
});