"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Noto_Sans } from "next/font/google";
import { useRouter } from "next/navigation";
const notoSans = Noto_Sans({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(true);
  const { data: session } = useSession();
  useEffect(() => {
    setTimeout(() => {
      setRevealed(true);
    }, 1000);
  }, []);
  useEffect(() => {
    session &&
      router.push(
        `/LandingPage/${encodeURIComponent(JSON.stringify(session))}`
      );
  }, [session]);
  return (
    <div className={styles.container}>
      <div className={styles.blob1}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#1E2A38"
            d="M30.9,-55.2C41,-47.7,50.9,-41.4,59.1,-32.4C67.4,-23.4,74,-11.7,75.5,0.9C77.1,13.4,73.4,26.9,67.6,40.1C61.8,53.4,53.8,66.4,42.2,68.5C30.6,70.6,15.3,61.7,0.1,61.5C-15.1,61.4,-30.3,70,-43.6,68.9C-56.9,67.8,-68.4,57,-70.6,43.9C-72.8,30.8,-65.6,15.4,-61.1,2.6C-56.6,-10.1,-54.7,-20.3,-53,-34.3C-51.3,-48.3,-49.9,-66.2,-41.1,-74.4C-32.3,-82.7,-16.2,-81.3,-2.9,-76.3C10.4,-71.3,20.8,-62.7,30.9,-55.2Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      <div className={styles.blob2}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#2D3A4D"
            d="M41.8,-69C54.1,-65.3,63.9,-53.9,69.4,-41.2C74.8,-28.4,75.9,-14.2,76.3,0.2C76.7,14.7,76.5,29.4,68.2,37.3C60,45.2,43.7,46.3,31,50.5C18.2,54.7,9.1,62,-3.1,67.4C-15.3,72.8,-30.6,76.2,-41.4,70.8C-52.2,65.5,-58.4,51.4,-66.2,38.1C-74.1,24.9,-83.5,12.4,-80.6,1.7C-77.6,-9,-62.3,-18.1,-51.1,-25.5C-39.9,-33,-32.9,-38.9,-25.1,-45.2C-17.3,-51.4,-8.6,-58,3.1,-63.3C14.7,-68.6,29.5,-72.6,41.8,-69Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      <section className={styles.content}>
        {revealed && (
          <div className={styles.roadAnimationContainer}>
            <Image src={"/car.png"} width={100} height={100} className={styles.car}/>
            <div className={styles.road}>
              <div className={styles.roadStripes}></div>
            </div>
          </div>
        )}
        <Image
          className={styles.logo}
          src="/logopng.png" // Path to the image in the public folder
          alt="logo"
          width={200} // Specify the width of the image
          height={100} // Specify the height of the image
        />
        {revealed && (
          <>
            <section>
              <button
                onClick={() => signIn("google")}
                className={`${styles.googleLogin} ${notoSans.className}`}
              >
                <Image
                  src={"/googleLogo.png"}
                  width={24}
                  height={24}
                  alt="Google Logo"
                />
                <h4> Sign In With Google</h4>
              </button>
              <h5
                className={`${notoSans.className} ${"greeting"}`}
                style={{ textAlign: "center" }}
              >
                AI-powered route and speed optimization for a faster, smoother
                drive
              </h5>
            </section>
          </>
        )}
      </section>
    </div>
  );
}
