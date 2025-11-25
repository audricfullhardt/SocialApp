import { Channel, Publication, Comment } from "../types";
import fixtures from "../mocks/fixtures.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_SLUG = process.env.NEXT_PUBLIC_API_SLUG;

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
};


export async function register(
  name: string,
  email: string,
  password: string,
  code: string
) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, code }),
  });
  return res.json();
};

export async function getChannels(): Promise<Channel[]> {
  const res = await fetch(`${API_URL}/${API_SLUG}/channels`, { headers: authHeader() });
  return res.json();
}

export async function getPublicationsByChannel(
  slug: string
): Promise<Publication[]> {
  const res = await fetch(`${API_URL}/publications?channelSlug=${slug}`, {
    headers: authHeader(),
  });
  return res.json();
}

export async function getCommentsByPublication(
  pubId: number
): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/comments?publicationId=${pubId}`, {
    headers: authHeader(),
  });
  return res.json();
}
