"use client";
import styles from "./headerComponent.module.css";
import { Autocomplete } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
export default function HeaderComponent({
  getDirectionsResponse,
  setNavigationFlag,
  setDirectionsResponse1,
  clearRouteFlag,
  setClearRouteFlag,
  optimizing,
  carPosition
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
          {destinationInputFlag&&!optimizing&&carPosition===null && (
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
