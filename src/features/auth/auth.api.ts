import { api } from "../../lib/axios";

export type User = {
  id: string;
  email: string;
  name: string;
};

export async function getMe() {
  const res = await api.get<{ user: User }>("/auth/me");
  return res.data.user;
}

export async function logoutRequest() {
  await api.post("/api/auth/logout");
}
