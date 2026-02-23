"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome {user.fullName} 🎉</h1>
      <p>This is your private home page.</p>
    </div>
  );
}