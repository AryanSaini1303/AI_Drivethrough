"use client";
import { useEffect, useState } from "react";
import style from "./page.module.css";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function LandingPage({ params }) {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  useEffect(() => {
    setUserData(JSON.parse(decodeURIComponent(params.session)).user);
  }, []);
  //   console.log(userData);
  return (
    <div className={style.wrapper}>
      <button
        onClick={() => {
          signOut({ callbackUrl: "/" }).then(() => router.push("/"));
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
