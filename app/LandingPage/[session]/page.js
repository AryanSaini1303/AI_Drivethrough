"use client";
import { useEffect, useState } from "react";
import style from "./page.module.css";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import PathModal from "@/components/pathModal";

export default function LandingPage({ params }) {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const { data: session, status } = useSession();
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [trafficLights, setTrafficLights] = useState([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [centerlat, setCenterLat] = useState();
  const [centerlng, setCenterLng] = useState();
  const center = {
    lat: parseFloat(`${centerlat}`),
    lng: parseFloat(`${centerlng}`),
  };
  // console.log(center);
  const geo = navigator.geolocation;
  geo.getCurrentPosition(getCoords);

  function getCoords(position) {
    if (position && !directionsResponse) {
      setCenterLat(position.coords.latitude);
      setCenterLng(position.coords.longitude);
    }
  }

  function getDirectionsResponse(response) {
    if (response) {
      setDirectionsResponse(response);
      console.log(directionsResponse);
      // console.log(response.routes[0].bounds.ci.lo);
      setCenterLat(response.routes[0].bounds.ci.hi);
      setCenterLng(response.routes[0].bounds.Hh.hi);
      // console.log(response.routes[0].bounds.Hh.lo);
      // Extract approximate positions for traffic lights from the route
      const trafficSignals = extractTrafficLightsFromRoute(response);
      setTrafficLights(trafficSignals);
    }
    else{
      setDirectionsResponse(response);
    }
  }

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

  // Function to extract approximate locations of traffic signals from the route
  function extractTrafficLightsFromRoute(response) {
    if (response) {
      const trafficSignals = [];
      const legs = response.routes[0].legs[0];
      legs.steps.forEach((step) => {
        if (step.maneuver && step.maneuver.includes("turn")) {
          trafficSignals.push({
            lat: step.end_location.lat(),
            lng: step.end_location.lng(),
          });
        }
      });
      return trafficSignals;
    }
  }

  // Dark mode styles for the map
  const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "on" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "administrative.land_parcel",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#181818" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1b1b1b" }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#373737" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3c3c3c" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [{ color: "#4e4e4e" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "transit",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3d3d3d" }],
    },
  ];

  return (
    status !== "loading" &&
    isLoaded && (
      <div className={style.wrapper}>
        <button
          onClick={() => {
            signOut({ callbackUrl: "/" }).then(() => router.push("/"));
          }}
        >
          Sign Out
        </button>
        <PathModal
          map={map}
          center={center}
          getDirectionsResponse={getDirectionsResponse}
        />
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100vw", height: "100vh" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            styles: mapStyles,
          }}
          onLoad={(map) => {
            setMap(map);
          }}
        >
          {directionsResponse && (
            <>
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  polylineOptions: {
                    strokeColor: "blue",
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                  },
                }}
              />
              {trafficLights.map((signal, index) => (
                <Marker
                  key={index}
                  position={signal}
                  icon={{
                    url: "/trafficLight.png",
                    scaledSize: new window.google.maps.Size(36, 36),
                  }}
                />
              ))}
            </>
          )}
        </GoogleMap>
      </div>
    )
  );
}
