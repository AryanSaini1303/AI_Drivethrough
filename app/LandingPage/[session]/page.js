"use client";
import { useEffect, useState } from "react";
import style from "./page.module.css";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function LandingPage({ params }) {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const { data: session, status } = useSession();
  console.log(status);
  useEffect(() => {
    setUserData(JSON.parse(decodeURIComponent(params.session)).user);
    setTimeout(() => {
      if (status === "unauthenticated") {
        signOut({callbackUrl:"/"}).then(()=>{
          router.push("/");
        })
      }
    }, 1000);
  }, [status]);
  if (status === "unauthenticated") {
    return "Unauthenticated";
  }
  return (
    status != "loading" && (
      <div className={style.wrapper}>
        <button
          onClick={() => {
            signOut({ callbackUrl: "/" }).then(() => router.push("/"));
          }}
        >
          Sign Out
        </button>
      </div>
    )
  );
}
