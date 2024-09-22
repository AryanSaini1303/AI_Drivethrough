"use client";
import styles from "./headerComponent.module.css";
import { Autocomplete } from "@react-google-maps/api";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
export default function HeaderComponent({
  getDirectionsResponse,
  setNavigationFlag,
  setDirectionsResponse1,
  clearRouteFlag,
  setClearRouteFlag,
  optimizing,
  carPosition,
}) {
  const originRef = useRef();
  const destinationRef = useRef();
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [originInputFlag, setOriginInputFlag] = useState(false);
  const [destinationInputFlag, setDestinationInputFlag] = useState(false);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    getDirectionsResponse(directionsResponse);
  }, [directionsResponse]);

  useEffect(() => {
    if (clearRouteFlag) {
      setDirectionsResponse(null);
      setDistance("");
      setDuration("");
      setOriginInputFlag(false);
      setDestinationInputFlag(false);
      originRef.current.value = "";
      destinationRef.current.value = "";
      setClearRouteFlag(false);
    }
  }, [clearRouteFlag]);

  async function calculateRoute(e) {
    if (destinationRef.current.value.length === 0) {
      alert("Enter a valid input!");
    }
    setDestinationInputFlag(false);
    setNavigationFlag(false);
    setDirectionsResponse1(null);
    setDirectionsResponse(null);
    e.preventDefault();
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  }

  function getCoords(position) {
    if (position && !directionsResponse) {
      originRef.current.value = `${position.coords.latitude},${position.coords.longitude}`;
    }
  }
  function handleLocationClick() {
    setOriginInputFlag(false);
    const geo = navigator.geolocation;
    geo.getCurrentPosition(getCoords);
  }

  return (
    <div className={styles.container}>
      <form onSubmit={calculateRoute}>
        <div className={styles.originInputContainer}>
          <section className={styles.logo}>
            <div className={styles.mainDot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.nav}>
              <svg
                viewBox="0 0 500 1000"
                fill="white"
                height="1.5rem"
                width="1.5rem"
              >
                <path d="M250 100c69.333 0 128.333 24.333 177 73s73 107.667 73 177c0 70.667-20.667 151.667-62 243s-83.333 165.667-126 223l-62 84c-6.667-8-15.667-19.667-27-35-11.333-15.333-31.333-45-60-89s-54-87.333-76-130-42-91.667-60-147S0 394 0 350c0-69.333 24.333-128.333 73-177s107.667-73 177-73m0 388c37.333 0 69.333-13.333 96-40s40-58.667 40-96-13.333-69-40-95-58.667-39-96-39-69 13-95 39-39 57.667-39 95 13 69.333 39 96 57.667 40 95 40" />
              </svg>
            </div>
          </section>
          <section className={styles.logoutNprofile}>
            <div>
              <img src={"https://picsum.photos/200"} alt="" />
            </div>
            <div>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                }}
                type="button"
              >
                <svg
                  viewBox="0 0 1024 1024"
                  fill="currentColor"
                  height="4rem"
                  width="4rem"
                >
                  <path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 01-112.7 75.9A352.8 352.8 0 01512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 01-112.7-75.9 353.28 353.28 0 01-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 7.9 7.9 15.3 16.1 22.4 24.5 3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82 271.7 82.6 79.6 277.1 82 516.4 84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7 3.4-5.3-.4-12.3-6.7-12.3zm88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 000-12.6z" />
                </svg>
              </button>
            </div>
          </section>
          <Autocomplete>
            <input
              type="text"
              name="Origin"
              placeholder="Origin"
              ref={originRef}
              onFocus={() => {
                setOriginInputFlag(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setOriginInputFlag(false);
                }, 100);
              }}
            />
          </Autocomplete>
          {originInputFlag && (
            <button
              type="button"
              style={{ width: "fit-content" }}
              onClick={handleLocationClick}
              className={styles.originSubmitButton}
            >
              <svg
                viewBox="0 0 500 1000"
                fill="white"
                height="1.2rem"
                width="1.2rem"
              >
                <path d="M250 100c69.333 0 128.333 24.333 177 73s73 107.667 73 177c0 70.667-20.667 151.667-62 243s-83.333 165.667-126 223l-62 84c-6.667-8-15.667-19.667-27-35-11.333-15.333-31.333-45-60-89s-54-87.333-76-130-42-91.667-60-147S0 394 0 350c0-69.333 24.333-128.333 73-177s107.667-73 177-73m0 388c37.333 0 69.333-13.333 96-40s40-58.667 40-96-13.333-69-40-95-58.667-39-96-39-69 13-95 39-39 57.667-39 95 13 69.333 39 96 57.667 40 95 40" />
              </svg>
            </button>
          )}
        </div>
        <section className={styles.destinationInputContainer}>
          <Autocomplete>
            <input
              type="text"
              name="Destination"
              placeholder="Destination"
              ref={destinationRef}
              onFocus={() => {
                setDestinationInputFlag(true);
              }}
              // onBlur={()=>{
              //   setTimeout(() => {
              //     setDestinationInputFlag(false);
              //   }, 100);
              // }}
            />
          </Autocomplete>
          {destinationInputFlag && !optimizing && carPosition === null && (
            <button type="submit" onClick={calculateRoute}>
              <svg
                baseProfile="tiny"
                viewBox="0 0 24 24"
                fill="white"
                height="1.2rem"
                width="1.2rem"
              >
                <path d="M16.972 6.251a1.999 1.999 0 00-2.72.777l-3.713 6.682-2.125-2.125a2 2 0 10-2.828 2.828l4 4c.378.379.888.587 1.414.587l.277-.02a2 2 0 001.471-1.009l5-9a2 2 0 00-.776-2.72z" />
              </svg>
            </button>
          )}
        </section>
      </form>
    </div>
  );
}
