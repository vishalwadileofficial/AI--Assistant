"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="h-screen w-full flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="rounded-full"
            style={{
              width: "48px",
              height: "48px",
              background: "radial-gradient(circle, rgba(108,92,231,0.5) 0%, transparent 70%)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
          <p className="text-sm" style={{ color: "#5a5a6e" }}>Loading VEDA...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to /login
  }

  return (
    <main className="h-screen w-full" style={{ background: "#0a0a0f" }}>
      <ChatInterface />
    </main>
  );
}
