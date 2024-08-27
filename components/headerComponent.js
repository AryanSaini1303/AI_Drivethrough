"use client";
import styles from "./headerComponent.module.css";
import { Autocomplete } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
export default function HeaderComponent({
  getDirectionsResponse,
  setNavigationFlag,
  setDirectionsResponse1,
  watchId,
  setWatchId,
}) {
  const originRef = useRef();
  const destinationRef = useRef();
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [originInputFlag, setOriginInputFlag] = useState(false);
  const [destinationInputFlag, setDestinationInputFlag] = useState(false);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [locationClickFlag, setLocationClickFlag] = useState(false);

  useEffect(() => {
    getDirectionsResponse(directionsResponse);
  }, [directionsResponse]);

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
    setLocationClickFlag(true);
    const geo = navigator.geolocation;
    geo.getCurrentPosition(getCoords);
  }

  function clearRoute() {
    setNavigationFlag(false);
    setDirectionsResponse1(null);
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    setOriginInputFlag(false);
    setDestinationInputFlag(false);
    originRef.current.value = "";
    destinationRef.current.value = "";
    // Stop the geolocation watch if it exists
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null); // Reset the watchId
    }
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
                  !locationClickFlag && setOriginInputFlag(false);
                }, 100);
              }}
            />
          </Autocomplete>
          {originInputFlag && (
            <button
              type="button"
              style={{ width: "fit-content" }}
              onClick={handleLocationClick}
            >
              <svg
                viewBox="0 0 500 1000"
                fill="white"
                height="1.5rem"
                width="1.5rem"
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
            />
          </Autocomplete>
          {destinationInputFlag && (
            <button type="submit" onClick={calculateRoute}>
              <svg
                fill="none"
                viewBox="0 0 15 15"
                height="0.9rem"
                width="0.9rem"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="square"
                  d="M1 7l4.5 4.5L14 3"
                />
              </svg>
            </button>
          )}
        </section>
        <section className={styles.btns}>
          <button type="button" onClick={clearRoute}>
            Clear
          </button>
        </section>
      </form>
    </div>
  );
}
