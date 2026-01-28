"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("token", "");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form className="flex flex-col gap-4 p-6 border rounded shadow-md w-full max-w-sm" onSubmit={handleSubmit}>
        <Button type="submit" onClick={logout}>Se déconnecter</Button>
      </form>
    </div>
  );
}
