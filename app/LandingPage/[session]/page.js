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
import trafficData from "@/data/gurugram_traffic_data.json";

/************************************************* */
// Helper function to check if a point is on the route
function isPointOnRoute(point, polyline, threshold = 50) {
  const toRadians = (degree) => (degree * Math.PI) / 180;

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  for (let i = 0; i < polyline.length - 1; i++) {
    const start = polyline[i];
    const end = polyline[i + 1];

    const d1 = haversineDistance(point.lat, point.lng, start.lat, start.lng);
    const d2 = haversineDistance(point.lat, point.lng, end.lat, end.lng);
    const segmentLength = haversineDistance(
      start.lat,
      start.lng,
      end.lat,
      end.lng
    );

    if (d1 + d2 <= segmentLength + threshold) {
      return true;
    }
  }
  return false;
}
/************************************************* */

export default function LandingPage({ params }) {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const { data: session, status } = useSession();
  const [map, setMap] = useState(null);
  const [directionsResponse1, setDirectionsResponse1] = useState(null);
  const [trafficLights, setTrafficLights] = useState([]);
  const [carPosition, setCarPosition] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  console.log(carPosition);
  const [centerlat, setCenterLat] = useState(null);
  const [centerlng, setCenterLng] = useState(null);
  const [originCoordinates, setOriginCoordinates] = useState({});
  const [destinationCoordinates, setDestinationCoordinates] = useState({});
  const [navigationFlag, setNavigationFlag] = useState(false);
  const center = {
    lat: centerlat ?? 28.4595, // Default to a known latitude if not set
    lng: centerlng ?? 77.0266, // Default to a known longitude if not set
  };

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

  function getDirectionsResponse(response) {
    if (response) {
      setDirectionsResponse1(response);

      const route = response.routes[0];
      const origin = route.legs[0].start_location;
      const destination = route.legs[0].end_location;

      const polyline = route.overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

      const lightsOnRoute = trafficData.filter((light) =>
        isPointOnRoute(
          { lat: light.latitude, lng: light.longitude },
          polyline,
          50 // Adjust this threshold as needed
        )
      );

      setTrafficLights(lightsOnRoute);
      setOriginCoordinates({ lat: origin.lat(), lng: origin.lng() });
      setDestinationCoordinates({
        lat: destination.lat(),
        lng: destination.lng(),
      });
      setCenterLat(origin.lat());
      setCenterLng(origin.lng());
    }
  }
  console.log(directionsResponse1);
  function startNavigation() {
    if (directionsResponse1) {
      setNavigationFlag(true);
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCarPosition({ lat: latitude, lng: longitude });
            setCenterLat(latitude);
            setCenterLng(longitude);
            // map.panTo(center);
          },
          (error) => {
            console.error("Error getting the user's position", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    }
  }
  useEffect(() => {
    if (!navigationFlag) {
      const geo = navigator.geolocation;
      geo.getCurrentPosition(getCoords);
    }
  }, [navigationFlag]);
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
        <button onClick={startNavigation} style={{ top: "2rem" }}>
          Start Navigation
        </button>
        <PathModal
          map={map}
          center={center}
          getDirectionsResponse={getDirectionsResponse}
          setNavigationFlag={setNavigationFlag}
          setDirectionsResponse1={setDirectionsResponse1}
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
            gestureHandling: "greedy",
          }}
          onLoad={(map) => {
            setMap(map);
          }}
        >
          {directionsResponse1 && (
            <>
              <DirectionsRenderer
                directions={directionsResponse1}
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
                  position={{ lat: signal.latitude, lng: signal.longitude }}
                  icon={{
                    url: "/trafficLight.png",
                    scaledSize: new window.google.maps.Size(80, 80),
                  }}
                />
              ))}
              {navigationFlag && carPosition && (
                <Marker
                  position={carPosition}
                  icon={{
                    url: "/navigationDot.png",
                    scaledSize: new window.google.maps.Size(15, 15),
                  }}
                />
              )}
            </>
          )}
        </GoogleMap>
      </div>
    )
  );
}
