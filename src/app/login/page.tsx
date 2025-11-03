"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../services/api";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await login(email, password);
    localStorage.setItem("token", data.token);
    router.push("/channels");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form className="flex flex-col gap-4 p-6 border rounded shadow-md w-full max-w-sm" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit">Se connecter</Button>
      </form>
    </div>
  );
}
