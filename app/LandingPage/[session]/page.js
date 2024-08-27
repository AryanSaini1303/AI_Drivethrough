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
// import PathModal from "@/components/pathModal";
import trafficData from "@/data/gurugram_traffic_data.json";
import HeaderComponent from "@/components/headerComponent";
import FooterComponent from "@/components/footerComponent";
import LandingPageLoader from "@/components/landingPageLoader";

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
  const [centerlat, setCenterLat] = useState(null);
  const [centerlng, setCenterLng] = useState(null);
  const [navigationFlag, setNavigationFlag] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [clearRouteFlag, setClearRouteFlag] = useState(false);
  const [optimizing,setOptimizing]=useState(false);
  const center = {
    lat: centerlat ?? 28.4595, // Default to a known latitude if not set
    lng: centerlng ?? 77.0266, // Default to a known longitude if not set
  };

  
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
      setCenterLat(origin.lat());
      setCenterLng(origin.lng());
    }
  }

  function getOptimizing(flag){
    setOptimizing(flag);
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

  useEffect(() => {
    const geo = navigator.geolocation;
    geo.getCurrentPosition(getCoords);
  }, []);

  useEffect(() => {
    setCarPosition(null);
  }, [clearRouteFlag]);

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
        {optimizing && (
          <div className={style.loadingShade}>
            <LandingPageLoader />
          </div>
        )}
        {/* <button
          onClick={() => {
            signOut({ callbackUrl: "/" }).then(() => router.push("/"));
          }}
          style={{zIndex:'1000'}}
        >
          Sign Out
        </button> */}
        <HeaderComponent
          getDirectionsResponse={getDirectionsResponse}
          setNavigationFlag={setNavigationFlag}
          setDirectionsResponse1={setDirectionsResponse1}
          watchId={watchId}
          setWatchId={setWatchId}
          clearRouteFlag={clearRouteFlag}
          setClearRouteFlag={setClearRouteFlag}
          optimizing={optimizing}
          carPosition={carPosition}// if we have carPosition then it means that the journey is optimized
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
              {carPosition&&trafficLights.map((signal, index) => (
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
        <FooterComponent
          map={map}
          center={center}
          directionsResponse1={directionsResponse1}
          setCenterLat={setCenterLat}
          setCenterLng={setCenterLng}
          watchId={watchId}
          setWatchId={setWatchId}
          setCarPosition={setCarPosition}
          setNavigationFlag={setNavigationFlag}
          navigationFlag={navigationFlag}
          setDirectionsResponse1={setDirectionsResponse1}
          setClearRouteFlag={setClearRouteFlag}
          getOptimizing={getOptimizing}
        />
      </div>
    )
  );
}
