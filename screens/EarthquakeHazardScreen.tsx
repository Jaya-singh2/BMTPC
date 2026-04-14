import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import Geolocation from "react-native-geolocation-service";
import AppLayout from "../components/AppLayout";

const MAP_CONFIG = {
  "Earthquake Hazard": {
    minLat: 6.4627,
    maxLat: 37.0841,
    minLng: 68.1097,
    maxLng: 97.3956,
  },

  "Wind Hazard": {
    minLat: 6.4627,
     maxLat: 39.4990,
     minLng: 68.1097,
      maxLng: 94.0956
  },

  "Flood Hazard": {
   minLat: 6.4627,
       maxLat: 39.1990,
       minLng: 68.1097,
        maxLng: 91.0956
  },

  "Landslide Hazard": {
      minLat: 6.4627,
     maxLat: 38.0000,
     minLng: 68.1097,
      maxLng: 94.0056
  },

  "Thunderstorm Hazard": {
   minLat: 6.4627,
       maxLat: 39.8000,
       minLng: 68.1097,
        maxLng: 94.0056
}
};

export default function HazardMapScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const hazardId = route?.params?.hazardId;
  const JPG_MAP_URL =
    route?.params?.mapImage ||
    "http://49.50.117.186/assets/uploads/img/hazards/1767087922_EQ_INDIA.jpg";

  const API_URL = `http://49.50.117.186/api/v1/hazard-state-assembly-coordinates?hazard_id=${hazardId}`;

  const PAGE_NAME = route?.params?.pageName;

  const webViewRef = useRef<WebView>(null);

  const [hazardData, setHazardData] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const [userLatLng, setUserLatLng] = useState<any>(null);

  /* ================= FETCH API ================= */

  useEffect(() => {
    if (!hazardId) {
      setApiLoading(false);
      return;
    }

    fetch(API_URL, { method: "POST" })
      .then((res) => res.json())
      .then((json) => {
        setHazardData(json?.data || []);
      })
      .catch(() => setHazardData([]))
      .finally(() => setApiLoading(false));
  }, [hazardId]);

  /* ================= LOCATION ================= */

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setLocationLoading(false);
            return;
          }
        }

        Geolocation.getCurrentPosition(
          (pos) => {
            setUserLatLng({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            setLocationLoading(false);
          },
          () => setLocationLoading(false),
          { enableHighAccuracy: true }
        );
      } catch {
        setLocationLoading(false);
      }
    };

    getLocation();
  }, []);

  /* ================= MESSAGE ================= */

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "MAP_READY") {
        setMapReady(true);
        return;
      }

      if (data.state_id) {
        const selected = hazardData.find(
          (s) => s.state_id === data.state_id
        );
        if (!selected) return;
        navigation.navigate("StateDetail", {
          stateData: selected,
          pageName: PAGE_NAME
        });
      }
    } catch {}
  };

  /* ================= HTML ================= */

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport"
content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

<style>

html,body{
  margin:0;padding:0;overflow:hidden;background:#fff;touch-action:none;
}

#wrapper{
  position:relative;width:100vw;height:100vh;overflow:hidden;touch-action:none;
}

#mapLayer{
  position:absolute;top:0;left:0;transform-origin:0 0;
}

#mapImage{
  width:100vw;height:auto;display:block;
}

#overlay{
  position:absolute;top:0;left:0;width:100%;height:100%;
}

polygon{
  stroke:none;
  cursor:pointer;
}

/* USER DOT */

#userDot{
  position:absolute;
  width:5px;
  height:5px;
  background:#ff0000;
  border-radius:50%;
  border:2px solid white;
  transform:translate(-50%, -50%);
  pointer-events:none;
  z-index:999;
  animation:pulse 1.5s infinite;
}

#userDot::after{
  content:'';
  position:absolute;
  width:100%;
  height:100%;
  background:rgba(255,0,0,0.4);
  border-radius:50%;
  top:0;
  left:0;
  animation:ripple 1.5s infinite;
}

@keyframes pulse{
  0%{
    transform: translate(-50%, -50%) scale(1);
  }
  50%{
    transform: translate(-50%, -50%) scale(1.2);
  }
  100%{
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes ripple{
  0%{
    transform: scale(1);
    opacity: 0.6;
  }
  100%{
    transform: scale(3);
    opacity: 0;
  }
}
/* LABEL */

#zoneLabel {
  position:absolute;
  background: rgba(255,255,255,0.5);
  padding:6px 10px;
  border-radius:6px;
  color:#cc0000;
  font-size:17px;
  font-weight:bold;
  transform:translate(-50%, 0);
  white-space:nowrap;
  pointer-events:none;
  z-index:9999;
  animation: blink 1s infinite;
  text-align: center;
}

@keyframes blink{
  0%{ opacity:1; }
  50%{ opacity:0; }
  100%{ opacity:1; }
}

</style>
</head>

<body>

<div id="wrapper">

  <div id="mapLayer">
    <img id="mapImage" src="${JPG_MAP_URL}" />
    <svg id="overlay"></svg>
    <div id="userDot" style="display:none;"></div>
  </div>

  <div id="zoneLabel" style="display:none;">
    You are in High Damage Risk Zone
  </div>

</div>

<script>

const hazardData = ${JSON.stringify(hazardData)};
const userLatLng = ${JSON.stringify(userLatLng)};
const MAP_CONFIG = ${JSON.stringify(MAP_CONFIG)};
const PAGE_NAME = "${PAGE_NAME}";
const INDIA_BOUNDS = MAP_CONFIG[PAGE_NAME] || MAP_CONFIG["Earthquake Hazard"];

function getZoneText(type){
  if(type === "Earthquake Hazard"){
    return "You are in <b>(Zone-II)</b><br><span style='color:red'>High Damage Risk Zone</span>";
  }
  if(type === "Wind Hazard"){
    return "You are in <b>(Zone-II)</b><br><span style='color:red'>Very High Damage Risk Zone</span>";
  }
  return ""; // ❌ no label for others
}

const img = document.getElementById('mapImage');
const overlay = document.getElementById('overlay');
const userDot = document.getElementById('userDot');
const zoneLabel = document.getElementById('zoneLabel');

const mapLayer = document.getElementById('mapLayer');
const wrapper = document.getElementById('wrapper');

let scale = 1;
let translateX = 0;
let translateY = 0;

let startDistance = 0;
let startScale = 1;
let lastTouchX = 0;
let lastTouchY = 0;
let isDragging = false;

let x = 0;
let y = 0;

/* ===== LABEL FIX ===== */

function updateLabelPosition() {
  if (!userLatLng) return;
  zoneLabel.style.left = (x * scale + translateX) + "px";
  zoneLabel.style.top  = (y * scale + translateY + 15) + "px";
}

/* ===== BOUNDS ===== */

function applyBounds(){

  const wrapperW = wrapper.clientWidth;
  const wrapperH = wrapper.clientHeight;

  const imgW = img.clientWidth * scale;
  const imgH = img.clientHeight * scale;

  if(imgW <= wrapperW){
    translateX = (wrapperW - imgW) / 2;
  } else {
    const minX = wrapperW - imgW;
    if(translateX > 0) translateX = 0;
    if(translateX < minX) translateX = minX;
  }

  if(imgH <= wrapperH){
    translateY = (wrapperH - imgH) / 2;
  } else {
    const minY = wrapperH - imgH;
    if(translateY > 0) translateY = 0;
    if(translateY < minY) translateY = minY;
  }
}

/* ===== TRANSFORM ===== */

function updateTransform(){

  applyBounds();

  mapLayer.style.transform =
    "translate(" + translateX + "px," + translateY + "px) scale(" + scale + ")";

  updateLabelPosition(); // ✅ FIX
}

/* ===== TOUCH ===== */

function getDistance(touches){
  let dx = touches[0].clientX - touches[1].clientX;
  let dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx*dx + dy*dy);
}

wrapper.addEventListener("touchstart", function(e){

  if(e.touches.length === 2){
    startDistance = getDistance(e.touches);
    startScale = scale;
  }

  if(e.touches.length === 1 && scale > 1){
    isDragging = true;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  }

});

wrapper.addEventListener("touchmove", function(e){

  e.preventDefault();

  if(e.touches.length === 2){

    let newDistance = getDistance(e.touches);
    let zoomFactor = newDistance / startDistance;
    let newScale = startScale * zoomFactor;

    if(newScale < 1) newScale = 1;
    if(newScale > 6) newScale = 6;

    const rect = wrapper.getBoundingClientRect();
    const centerX = (e.touches[0].clientX + e.touches[1].clientX)/2 - rect.left;
    const centerY = (e.touches[0].clientY + e.touches[1].clientY)/2 - rect.top;

    translateX = centerX - (centerX - translateX) * (newScale/scale);
    translateY = centerY - (centerY - translateY) * (newScale/scale);

    scale = newScale;

    updateTransform();
  }

  if(e.touches.length === 1 && isDragging){

    let dx = e.touches[0].clientX - lastTouchX;
    let dy = e.touches[0].clientY - lastTouchY;

    translateX += dx;
    translateY += dy;

    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;

    updateTransform();
  }

});

wrapper.addEventListener("touchend", function(){
  isDragging = false;
});

/* ===== INIT ===== */

img.onload = function(){

  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  overlay.setAttribute("viewBox","0 0 "+naturalW+" "+naturalH);

  // ✅ POLYGONS (CLICK WORKING)
  hazardData.forEach(state=>{

    if(!state.coordinates?.length) return;

    const pts = state.coordinates.map(p=>p[0]+","+p[1]).join(" ");

    const poly =
      document.createElementNS("http://www.w3.org/2000/svg","polygon");

    poly.setAttribute("points", pts);

    poly.setAttribute("fill",
      state.severity==="High" ? "rgba(255,0,0,.45)" :
      state.severity==="Medium" ? "rgba(255,165,0,.45)" :
      "transparent"
    );

    poly.setAttribute("stroke", "none");

    poly.onclick=()=>{
      window.ReactNativeWebView.postMessage(
        JSON.stringify({state_id: state.state_id})
      );
    };

    overlay.appendChild(poly);

  });

  if(userLatLng){

    const renderedW = img.clientWidth;
    const renderedH = img.clientHeight;

x =
 ((userLatLng.longitude-INDIA_BOUNDS.minLng)/
 (INDIA_BOUNDS.maxLng-INDIA_BOUNDS.minLng))*renderedW;

y =
 ((INDIA_BOUNDS.maxLat-userLatLng.latitude)/
 (INDIA_BOUNDS.maxLat-INDIA_BOUNDS.minLat))*renderedH;

// ✅ apply offset safely
if(INDIA_BOUNDS.offsetX){
  x += INDIA_BOUNDS.offsetX;
}
if(INDIA_BOUNDS.offsetY){
  y += INDIA_BOUNDS.offsetY;
}

// ✅ clamp inside image (VERY IMPORTANT)
x = Math.max(0, Math.min(renderedW, x));
y = Math.max(0, Math.min(renderedH, y));

    userDot.style.left = x + "px";
    userDot.style.top  = y + "px";

    userDot.style.display = "block";
    const labelText = getZoneText(PAGE_NAME);

    if(labelText){
      zoneLabel.innerHTML = labelText;
      zoneLabel.style.display = "block";
    }else{
      zoneLabel.style.display = "none";
    }

    scale = 3;

    translateX = wrapper.clientWidth/2 - x*scale;
    translateY = wrapper.clientHeight/2 - y*scale;

    updateTransform();
  }

  window.ReactNativeWebView.postMessage(JSON.stringify({type:"MAP_READY"}));

};

</script>

</body>
</html>
`;

  return (
    <AppLayout title={PAGE_NAME} subtitle="India" showBack showLogo>
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ html }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
        />

        {(apiLoading || locationLoading || !mapReady) && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#6f8f55" />
          </View>
        )}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});