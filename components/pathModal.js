"use client";
import styles from "./pathModal.module.css";
import { Autocomplete } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

export default function PathModal({
  map,
  center,
  getDirectionsResponse,
  setNavigationFlag,
  setDirectionsResponse1,
  watchId,
  setWatchId
}) {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const originRef = useRef();
  const destinationRef = useRef();
  const [originInputFlag, setOriginInputFlag] = useState(false);

  useEffect(() => {
    getDirectionsResponse(directionsResponse);
    console.log(directionsResponse);
  }, [directionsResponse]);

  async function calculateRoute(e) {
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

  function clearRoute() {
    setNavigationFlag(false);
    setDirectionsResponse1(null);
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
    // Stop the geolocation watch if it exists
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null); // Reset the watchId
    }
  }
  

  function getCoords(position) {
    if (position && !directionsResponse) {
      originRef.current.value = `${position.coords.latitude},${position.coords.longitude}`;
    }
  }
  
  function handleLocationClick() {
    const geo = navigator.geolocation;
    geo.getCurrentPosition(getCoords);
  }

  return (
    <div className={styles.container}>
      <section className={styles.inputSection}>
        <form onSubmit={calculateRoute}>
          <Autocomplete>
            <input
              type="text"
              name="Origin"
              placeholder="Origin"
              ref={originRef}
              onFocus={() => {
                setOriginInputFlag(true);
              }}
            />
          </Autocomplete>
          {originInputFlag && (
            <button
              type="button"
              style={{ width: "fit-content" }}
              onClick={handleLocationClick}
            >
              currLoc
            </button>
          )}
          <Autocomplete>
            <input
              type="text"
              name="Destination"
              placeholder="Destination"
              ref={destinationRef}
              onFocus={() => {
                setOriginInputFlag(false);
              }}
            />
          </Autocomplete>
          <button
            type="submit"
            onFocus={() => {
              setOriginInputFlag(false);
            }}
          >
            Calculate Route
          </button>
          <button
            type="button"
            onClick={clearRoute}
            onFocus={() => {
              setOriginInputFlag(false);
            }}
          >
            clear
          </button>
        </form>
      </section>
      <section className={styles.infoSection}>
        <h5>
          Distance: <span>{distance}</span>
        </h5>
        <h5>
          Duration: <span>{duration}</span>
        </h5>
        <button
          type="button"
          onClick={() => {
            map.panTo(center);
          }}
        >
          center
        </button>
      </section>
    </div>
  );
}
