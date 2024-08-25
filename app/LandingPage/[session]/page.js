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
function isPointOnRoute(point, polyline, threshold) {
  const toRadians = (degree) => (degree * Math.PI) / 180;

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [trafficLights, setTrafficLights] = useState([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [centerlat, setCenterLat] = useState();
  const [centerlng, setCenterLng] = useState();
  const [originCoordinates, setOriginCoordinates] = useState({});
  const [destinationCoordinates, setDestinationCoordinates] = useState({});
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
      /************steps to derive origin and destination coordinates************** */
      const route = response.routes[0];
      const origin = route.legs[0].start_location;
      const destination = route.legs[0].end_location;
      setOriginCoordinates({ lat: origin.lat(), lng: origin.lng() });
      console.log(originCoordinates);
      setDestinationCoordinates({
        lat: destination.lat(),
        lng: destination.lng(),
      });
      console.log(destinationCoordinates);
      console.log(originCoordinates, destinationCoordinates);
      /***********steps to derive origin and destination coordinates*************** */

      /********************steps to find the traffic lights*********************** */
      console.log(route);
      const polyline = route.overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));
      console.log(polyline);
      const lightsOnRoute = trafficData.filter((light) =>
        isPointOnRoute(
          { lat: light.latitude, lng: light.longitude },
          polyline,
          50
        )
      );
      setTrafficLights(lightsOnRoute);
      console.log(trafficData.length);
      console.log(trafficLights.length);
      /********************steps to find the traffic lights*********************** */
      setCenterLat(originCoordinates.lat);
      setCenterLng(originCoordinates.lng);
    } else {
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
                  position={{ lat: signal.latitude, lng: signal.longitude }}
                  icon={{
                    url: "/trafficLight.png",
                    scaledSize: new window.google.maps.Size(80, 80),
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
