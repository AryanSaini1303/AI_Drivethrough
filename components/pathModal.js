"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./pathModal.module.css";
import { Autocomplete } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

export default function PathModal({ map, center, getDirectionsResponse, setNavigationFlag }) {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const originRef = useRef();
  const destinationRef = useRef();
  useEffect(() => {
    getDirectionsResponse(directionsResponse);
    console.log(directionsResponse);
  }, [directionsResponse]);
  async function calculateRoute(e) {
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
    // console.log(results);
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text); 
  }
  function clearRoute() {
    setNavigationFlag(false);
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
  }
  return (
    <div className={styles.container}>
      <section className={styles.inputSection}>
        <form onSubmit={calculateRoute}>
          <Autocomplete>
            <input
              type="text"
              name="Origin"
              id=""
              placeholder="Origin"
              ref={originRef}
            />
          </Autocomplete>
          <Autocomplete>
            <input
              type="text"
              name="Destination"
              id=""
              placeholder="Destination"
              ref={destinationRef}
            />
          </Autocomplete>
          <button type="submit">Calculate Route</button>
          <button type="button" onClick={clearRoute}>
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
