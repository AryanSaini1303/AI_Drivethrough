"use client";
import { useEffect, useRef, useState } from "react";
import style from "./page.module.css";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import trafficData from "@/data/cleaned_data.json";
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
  const [optimizing, setOptimizing] = useState(false);
  const [userLocation1, setUserLocation1] = useState({});
  const [predictedSpeed, setPredictedSpeed] = useState(0);
  const [trafficSignalSaturation, setTrafficSignalSaturation] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [reachingProbability, setReachingProbability] = useState();
  const [displayInfo, setDisplayInfo] = useState({});
  const [eta, setEta] = useState();
  const [timeDifference, setTimeDifference] = useState();
  const [currentTrafficLightsLeft, setCurrentTrafficLightsLeft] = useState();
  const currentTrafficLightsLeftRef = useRef(currentTrafficLightsLeft);
  const center = {
    lat: centerlat ?? 28.4595, // Default to a known latitude if not set
    lng: centerlng ?? 77.0266, // Default to a known longitude if not set
  };
  const [drag,setDrag]=useState(false);

  // Get current position of the user
  function getCoords(position) {
    setUserLocation1({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
    if (position && !directionsResponse1) {
      setCenterLat(position.coords.latitude);
      setCenterLng(position.coords.longitude);
    } // uncomment this to autocenter while navigation
  }

  function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Handle response from Google Directions API
  function getDirectionsResponse(response) {
    if (response) {
      setDirectionsResponse1(response);
      const route = response.routes[0];
      const origin = route.legs[0].start_location;
      const polyline = route.overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));
      const lightsOnRoute = trafficData.filter((light) =>
        isPointOnRoute(
          { lat: light.latitude, lng: light.longitude },
          polyline,
          25 // Adjust this threshold as needed
        )
      );
      setTrafficLights(lightsOnRoute);
      setCenterLat(origin.lat());
      setCenterLng(origin.lng());
    }
  }

  useEffect(() => {
    // let timer = setTimeout(() => {
      if (directionsResponse1 && !trafficSignalSaturation) {
        setCenterLat(userLocation1.lat);
        setCenterLng(userLocation1.lng); // uncomment this to autocenter map while navigation
        const userLocation = new google.maps.LatLng(userLocation1);
        const service = new google.maps.DistanceMatrixService();
        const maxDestinations = 25; // Google Maps API limit
        const destinationChunks = chunkArray(trafficLights, maxDestinations);
        destinationChunks.forEach((chunk, chunkIndex) => {
          const destinations = chunk.map(
            (signal) =>
              new google.maps.LatLng(signal.latitude, signal.longitude)
          );
          service.getDistanceMatrix(
            {
              origins: [userLocation],
              destinations: destinations,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
              if (status === "OK") {
                let combinedArray = response.rows[0].elements.map(
                  (result, index) => ({
                    result,
                    trafficLight:
                      trafficLights[chunkIndex * maxDestinations + index],
                  })
                );
                // Filter out traffic lights that are within 50 meters
                combinedArray = combinedArray.filter(
                  (item) => item.result.distance.value > 50
                );
                setCurrentTrafficLightsLeft(combinedArray);
                // Sort the remaining traffic lights by distance
                combinedArray.sort(
                  (a, b) => a.result.distance.value - b.result.distance.value
                );
                // Update the trafficLights state with the filtered traffic lights
                setTrafficLights((prevTrafficLights) => {
                  const updatedTrafficLights = [...prevTrafficLights];
                  // Remove the signals that were filtered out
                  updatedTrafficLights.splice(
                    chunkIndex * maxDestinations,
                    chunk.length,
                    ...combinedArray.map((item) => item.trafficLight)
                  );
                  return updatedTrafficLights;
                });
              } else {
                console.error("DistanceMatrixService failed due to: " + status);
              }
            }
          );
        });
      }
    // }, 1000);
    // return () => clearTimeout(timer);
  }, [userLocation1, directionsResponse1]);

  // Update the ref whenever currentTrafficLightsLeft changes
  useEffect(() => {
    currentTrafficLightsLeftRef.current = currentTrafficLightsLeft;
  }, [currentTrafficLightsLeft]);

  useEffect(() => {
    // Process the traffic lights
    const intervalId = setInterval(() => {
      if (directionsResponse1) {
        const trafficLights = currentTrafficLightsLeftRef.current;
        if (trafficLights && trafficLights.length !== 0) {
          const upcomingSignalDistance = trafficLights[0].result.distance.value;
          const greenDuration = trafficLights[0].trafficLight.greenDuration;
          const redDuration = trafficLights[0].trafficLight.redDuration;
          const initialTime = trafficLights[0].trafficLight.initialTime;
          const currentTimeHours = new Date().getHours();
          const currentTimeMinutes = new Date().getMinutes();
          const currentTimeSeconds = new Date().getSeconds();
          const currentTime =
            currentTimeHours * 3600 +
            currentTimeMinutes * 60 +
            currentTimeSeconds; // Current time in seconds
          const actualCurrentTime = (currentTime - initialTime + 86400) % 86400; // Ensure the time is non-negative and wraps around a 24-hour clock
          const signalInfo = predictSignalTiming(
            greenDuration,
            redDuration,
            actualCurrentTime
          );
          while (true) {
            if (upcomingSignalDistance / signalInfo.greenWindow > 80 / 3.6) {
              signalInfo.greenWindow += greenDuration + redDuration;
              continue;
            } else {
              setPredictedSpeed(upcomingSignalDistance / signalInfo.greenWindow);
              // const eta = upcomingSignalDistance / ((50 * 1.1) / 3.6);
              const eta=upcomingSignalDistance/currentSpeed;
              setEta(eta);
              const timeDifference = Math.sqrt(
                (eta - signalInfo.greenWindow) * (eta - signalInfo.greenWindow)
              );
              setTimeDifference(timeDifference);
              if (
                timeDifference > greenDuration * 0.25 &&
                timeDifference < greenDuration - greenDuration * 0.25
              ) {
                setReachingProbability(100);
              } else if (
                (timeDifference > greenDuration - greenDuration * 0.25 &&
                  timeDifference < greenDuration) ||
                (timeDifference > 0 && timeDifference < greenDuration * 0.25)
              ) {
                setReachingProbability(25);
              } else {
                setReachingProbability(101);
              }
              break;
            }
          }
          setDisplayInfo({
            current_speed: currentSpeed,
            // current_speed:(50 * 1.1) / 3.6,
            signal_status: signalInfo.currentSignal,
            remaining_distance: upcomingSignalDistance,
            green_window: signalInfo.greenWindow,
          });
        } else {
          setTrafficSignalSaturation(true);
          setReachingProbability(100);
          clearInterval(intervalId);
        }
      }
    }, 1000)
  }, [userLocation1, directionsResponse1]);

  function predictSignalTiming(greenDuration, redDuration, currentTime) {
    // Total duration of one cycle
    const cycleDuration = greenDuration + redDuration;
    // Elapsed time within the current cycle
    const elapsedTime = currentTime % cycleDuration;
    // Determine the current signal state and time remaining for change
    let currentSignal, greenWindow;
    if (elapsedTime < greenDuration) {
      // If elapsed time is within the green signal duration
      currentSignal = "Green";
      greenWindow = greenDuration - elapsedTime; // time to reach signal to have 5 seconds to cross the signal
    } else {
      // If elapsed time exceeds green signal duration, it's in the red signal phase
      currentSignal = "Red";
      greenWindow = cycleDuration - elapsedTime + greenDuration; // time to reach signal to have 5 seconds to cross the signalss
    }
    return {
      currentSignal: currentSignal,
      greenWindow: greenWindow,
    };
  }

  function getOptimizing(flag) {
    setOptimizing(flag);
    setDrag(false);
  }

  function getCurrentSpeedFromFooter(speed) {
    setCurrentSpeed(speed);
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

  const geo = navigator.geolocation;
  setInterval(() => {
    geo.getCurrentPosition(getCoords);
  }, 3000);

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
        <HeaderComponent
          getDirectionsResponse={getDirectionsResponse}
          setNavigationFlag={setNavigationFlag}
          setDirectionsResponse1={setDirectionsResponse1}
          watchId={watchId}
          setWatchId={setWatchId}
          clearRouteFlag={clearRouteFlag}
          setClearRouteFlag={setClearRouteFlag}
          optimizing={optimizing}
          carPosition={carPosition}
        />

        <GoogleMap
          center={!drag?center:null}
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
          onDrag={(()=>{setDrag(true)})}
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
              {carPosition &&
                trafficLights.map((signal, index) => (
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
        {directionsResponse1 && (
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
            predictedSpeed={predictedSpeed}
            trafficSignalSaturation={trafficSignalSaturation}
            getCurrentSpeedFromFooter={getCurrentSpeedFromFooter}
            reachingProbability={reachingProbability}
            setDrag={setDrag}
          />
        )}

        <section
          className="info"
          style={{
            display: "flex",
            gap: "0.5rem",
            position: "absolute",
            zIndex: "100000",
            bottom: "5.5rem",
            left: "0",
            color: "white",
            backgroundColor: "black",
            borderRadius: "10px",
            padding: "0.5rem",
            alignItems: "center",
          }}
        >
          <div className="signal">
            <div
              className="signal"
              style={{
                backgroundColor: `${displayInfo.signal_status}`,
                height: "2rem",
                width: "2rem",
                borderRadius: "50%",
              }}
            ></div>
          </div>
          <div className="values">
            <h6 style={{ margin: "0", fontWeight: "400" }}>
              Current Speed:{" "}
              {displayInfo.current_speed
                ? `${displayInfo.current_speed.toFixed(2)} kmph`
                : "--"}
            </h6>
            <h6 style={{ margin: "0", fontWeight: "400" }}>
              ETA: {eta ? `${eta.toFixed(2)}s` : "--"}
            </h6>
            <h6 style={{ margin: "0", fontWeight: "400" }}>
              Rem. Distance:{" "}
              {displayInfo.remaining_distance
                ? `${displayInfo.remaining_distance}m`
                : "--"}
            </h6>
            <h6 style={{ margin: "0", fontWeight: "400" }}>
              Time Diff.:{" "}
              {timeDifference ? `${timeDifference.toFixed(2)}s` : "--"}
            </h6>
            <h6 style={{ margin: "0", fontWeight: "400" }}>
              Green Window:{" "}
              {displayInfo.green_window ? `${displayInfo.green_window}s` : "--"}
            </h6>
          </div>
        </section>
      </div>
    )
  );
}
