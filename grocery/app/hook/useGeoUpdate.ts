import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { getSocket } from "@/lib/websocket";

export const useGeoUpdate = (
  onLocationUpdate?: (lat: number, lon: number) => void,
) => {
  const dispatch = useAppDispatch();
  const { userData } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return;

    const socket = getSocket(dispatch, userData);

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationUpdate?.(latitude, longitude);

        if (socket?.readyState === WebSocket.OPEN && userData?.id) {
          socket.send(
            JSON.stringify({
              type: "update-location",
              userId: userData.id,
              latitude,
              longitude,
            }),
          );
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            console.error("User denied Geolocation access.");
            break;
          case err.POSITION_UNAVAILABLE:
            console.error("Location info unavailable (GPS signal lost).");
            break;
          case err.TIMEOUT:
            console.error("Location request timed out.");
            break;
          default:
            console.error("Unknown Geo Error:", err.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [userData, dispatch]);
};
