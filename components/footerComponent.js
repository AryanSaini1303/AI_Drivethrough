"use client";
import { useEffect, useState } from "react";
import styles from "./footerComponent.module.css";
export default function FooterComponent({
  map,
  center,
  directionsResponse1,
  setCenterLat,
  setCenterLng,
  watchId,
  setWatchId,
  setCarPosition,
  setNavigationFlag,
  navigationFlag,
  setDirectionsResponse1,
  setClearRouteFlag,
}) {
  useEffect(() => {
    const geo = navigator.geolocation;
    geo.getCurrentPosition(getCoords);
  }, []);

  function getCoords(position) {
    if (position && !directionsResponse1) {
      setCenterLat(position.coords.latitude);
      setCenterLng(position.coords.longitude);
    }
  }

  function startNavigation() {
    if (directionsResponse1) {
      setNavigationFlag(true);
      // Stop any previous geolocation watch
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Update the car's position on the map
            setCarPosition({ lat: latitude, lng: longitude });
            // Center the map on the car's position
            setCenterLat(latitude);
            setCenterLng(longitude);
            // map.panTo(center);
          },
          (error) => {
            handleGeolocationError(error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000, // Increased timeout to 10 seconds
          }
        );
        // Store the watchId so it can be cleared later
        setWatchId(id);
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    }
  }

  // Error handling function
  function handleGeolocationError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error("User denied the request for Geolocation.");
        alert("Please enable location permissions to use this feature.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.error("Location information is unavailable.");
        alert(
          "Location information is currently unavailable. Please try again later."
        );
        break;
      case error.TIMEOUT:
        console.error("The request to get user location timed out.");
        alert(
          "Unable to retrieve location. The request timed out. Please try again."
        );
        break;
      case error.UNKNOWN_ERROR:
        console.error("An unknown error occurred.");
        alert("An unknown error occurred while retrieving location.");
        break;
      default:
        console.error("An unexpected error occurred.");
        alert("An unexpected error occurred. Please try again.");
        break;
    }
  }

  function clearRoute() {
    setNavigationFlag(false);
    setDirectionsResponse1(null);
    setClearRouteFlag(true);
    // Stop the geolocation watch if it exists
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null); // Reset the watchId
    }
  }

  useEffect(() => {
    if (!navigationFlag) {
      const geo = navigator.geolocation;
      geo.getCurrentPosition(getCoords);
    }
  }, [navigationFlag]);
  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={() => {
          map.panTo(center);
        }}
      >
        <svg viewBox="0 0 24 24" fill="white" height="1.5rem" width="1.5rem">
          <path d="M16 12 A4 4 0 0 1 12 16 A4 4 0 0 1 8 12 A4 4 0 0 1 16 12 z" />
          <path d="M13 4.069V2h-2v2.069A8.01 8.01 0 004.069 11H2v2h2.069A8.008 8.008 0 0011 19.931V22h2v-2.069A8.007 8.007 0 0019.931 13H22v-2h-2.069A8.008 8.008 0 0013 4.069zM12 18c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" />
        </svg>
      </button>
      <button onClick={startNavigation} style={{ top: "2rem", zIndex: "1000" }}>
        Start Journey
      </button>
      <button type="button" onClick={clearRoute}>
        <svg viewBox="0 0 470 1000" fill="white" height="1.4rem" width="1.4rem">
          <path d="M452 656c12 12 18 26.333 18 43s-6 31-18 43c-12 10.667-26.333 16-43 16s-31-5.333-43-16L234 590 102 742c-12 10.667-26.333 16-43 16s-31-5.333-43-16C5.333 730 0 715.667 0 699s5.333-31 16-43l138-156L16 342C5.333 330 0 315.667 0 299s5.333-31 16-43c12-10.667 26.333-16 43-16s31 5.333 43 16l132 152 132-152c12-10.667 26.333-16 43-16s31 5.333 43 16c12 12 18 26.333 18 43s-6 31-18 43L314 500l138 156" />
        </svg>
      </button>
    </div>
  );
}
