"use client";
import { useEffect, useState } from "react";
import style from "./page.module.css";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
export default function LandingPage({ params }) {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const { data: session, status } = useSession();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });
  console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const [centerlat, setCenterLat] = useState();
  const [centerlng, setCenterLng] = useState();
  const center = {
    lat: parseFloat(`${centerlat}`),
    lng: parseFloat(`${centerlng}`),
  };
  const geo = navigator.geolocation;
  geo.getCurrentPosition(getCoords);
  function getCoords(position) {
    setCenterLat(position.coords.latitude);
    setCenterLng(position.coords.longitude);
  }
  console.log(centerlat);
  console.log(centerlng);
  console.log(center);
  useEffect(() => {
    setUserData(JSON.parse(decodeURIComponent(params.session)).user);
    setTimeout(() => {
      if (status === "unauthenticated") {
        signOut({ callbackUrl: "/" }).then(() => {
          router.push("/");
        });
      }
    }, 1000);
  }, [status]);
  if (status === "unauthenticated") {
    return "Unauthenticated";
  }
  return (
    status != "loading" &&
    isLoaded && (
      <div className={style.wrapper}>
        <button
          onClick={() => {
            signOut({ callbackUrl: "/" }).then(() => router.push("/"));
          }}
        >
          Sign Out
        </button>
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100vw", height: "100vh" }}
        ></GoogleMap>
      </div>
    )
  );
}
