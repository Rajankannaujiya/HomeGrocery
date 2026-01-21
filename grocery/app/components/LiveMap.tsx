"use client"
import { useEffect } from "react";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";


import "leaflet/dist/leaflet.css";
import { LocationType } from "../types/user";


interface LiveProps {
  userLocation: LocationType;
  deliveryBoyLocation: LocationType;
}

function RecenterAutomatically({ location }: { location: LocationType }) {
  const map = useMap();
  useEffect(() => {
    map.setView([location.latitude, location.longitude], map.getZoom(),{
      animate:true
    });
  }, [location.latitude, location.longitude, map]);
  return null;
}

export default function LiveMap({ userLocation, deliveryBoyLocation }: LiveProps) {


  const hasUserCoords = userLocation?.latitude && userLocation?.longitude;
  const hasRiderCoords = deliveryBoyLocation?.latitude && deliveryBoyLocation?.longitude;

  if (!hasUserCoords && !hasRiderCoords) {
    return (
      <div className="w-full h-125 bg-gray-100 flex items-center justify-center rounded-xl">
        <p className="text-gray-500 animate-pulse">Waiting for GPS signal...</p>
      </div>
    );
  }

  const deliveryBoyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
    iconSize: [45, 45],
    iconAnchor: [22, 45],
  });

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
    iconSize: [45, 45],
    iconAnchor: [22, 45],
  });

  const linePosition: [number, number][] = [
    [userLocation.latitude, userLocation.longitude],
    [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]
  ];

  const center: LatLngExpression = deliveryBoyLocation &&  [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude];


  return (
    <div className="w-full z-20 h-125 rounded-xl overflow-hidden shadow-2xl border-4 border-white relative">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Marker */}
        {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>Delivery Address</Popup>
        </Marker>}

        {/* Delivery Boy Marker */}
        <Marker position={[deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]} icon={deliveryBoyIcon}>
          <Popup>Delivery Partner is here</Popup>
        </Marker>

        <Polyline 
          positions={linePosition} 
          pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.6 }} 
        />

        <RecenterAutomatically location={deliveryBoyLocation ? deliveryBoyLocation : userLocation} />
      </MapContainer>
    </div>
  );
}