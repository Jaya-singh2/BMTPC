import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import Geolocation from "react-native-geolocation-service";
import AppLayout from "../components/AppLayout";

/* =====================================================
   TYPES
===================================================== */

type Coordinate = [number, number];

interface HazardState {
  state_id: number;
  state_name: string;
  severity: "Low" | "Medium" | "High";
  image: string;
  coordinates: Coordinate[];
}

interface ApiResponse {
  status: boolean;
  data: HazardState[];
}

type Screen = "hazards" | "about" | "feedback";

/* =====================================================
   CONSTANTS
===================================================== */

const API_URL =
  "http://49.50.117.186/api/v1/hazard-state-assembly-coordinates?hazard_id=1";

const JPG_MAP_URL =
  "http://49.50.117.186/assets/uploads/img/hazards/1767087922_EQ_INDIA.jpg";

/* India bounds for GPS → pixel conversion */
const INDIA_BOUNDS = {
  minLat: 6.4627,
  maxLat: 37.0841,
  minLng: 68.1097,
  maxLng: 97.3956,
};

/* =====================================================
   SCREEN
===================================================== */

export default function HazardMapScreen() {
  const navigation = useNavigation<any>();
  const webViewRef = useRef<WebView>(null);

  const [activeTab, setActiveTab] = useState<Screen>("hazards");
  const [hazardData, setHazardData] = useState<HazardState[]>([]);
  const [loading, setLoading] = useState(true);

  /* ⭐ store LAT/LNG only */
  const [userLatLng, setUserLatLng] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /* =====================================================
     FETCH STATES
  ===================================================== */

  useEffect(() => {
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then((json: ApiResponse) => setHazardData(json?.data || []))
      .catch(() => setHazardData([]))
      .finally(() => setLoading(false));
  }, []);

  /* =====================================================
     GET GPS LOCATION
  ===================================================== */

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        }

        Geolocation.getCurrentPosition(
          pos => {
            const { latitude, longitude } = pos.coords;

            console.log("USER LOCATION:", latitude, longitude);

            setUserLatLng({ latitude, longitude });
          },
          err => console.log(err),
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      } catch {}
    };

    getLocation();
  }, []);

  /* =====================================================
     STATE CLICK
  ===================================================== */

  const onMessage = (event: any) => {
    try {
      const { state_id } = JSON.parse(event.nativeEvent.data);

      const selected = hazardData.find(s => s.state_id === state_id);

      if (!selected) return;

      navigation.navigate("StateDetail", {
        stateData: selected,
      });
    } catch {}
  };

  /* =====================================================
     LOADER
  ===================================================== */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6f8f55" />
      </View>
    );
  }

  /* =====================================================
     WEBVIEW HTML
===================================================== */
const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport"
content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

<style>
html,body{
  margin:0;
  padding:0;
  overflow:hidden;
  background:#fff;
  touch-action:none;
}

#wrapper{
  position:relative;
  width:100vw;
  height:100vh;
  overflow:hidden;
  touch-action:none;
}

#mapLayer{
  position:absolute;
  top:0;
  left:0;
  transform-origin:0 0;
}

#mapImage{
  width:100vw;
  height:auto;
  display:block;
}

#overlay{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
}

polygon{
  stroke:#ff6600;
  stroke-width:2;
  cursor:pointer;
}

#userDot{
  position:absolute;
  width:14px;
  height:14px;
  background:red;
  border-radius:50%;
  border:2px solid white;
  transform:translate(-7px,-7px);
  pointer-events:none;
  animation:blink 1s infinite;
  z-index:999;
}

@keyframes blink{
  0%{opacity:1;}
  50%{opacity:0.2;}
  100%{opacity:1;}
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
</div>

<script>

const hazardData = ${JSON.stringify(hazardData)};
const userLatLng = ${JSON.stringify(userLatLng)};
const INDIA_BOUNDS = ${JSON.stringify(INDIA_BOUNDS)};

const img = document.getElementById('mapImage');
const overlay = document.getElementById('overlay');
const userDot = document.getElementById('userDot');
const mapLayer = document.getElementById('mapLayer');
const wrapper = document.getElementById('wrapper');

let scale = 1;
let translateX = 0;
let translateY = 0;

let startDistance = 0;
let startScale = 1;
let startX = 0;
let startY = 0;
let lastTouchX = 0;
let lastTouchY = 0;
let isDragging = false;

/* ---------- UPDATE TRANSFORM ---------- */
function updateTransform(){
  mapLayer.style.transform =
    "translate(" + translateX + "px," + translateY + "px) scale(" + scale + ")";
}

/* ---------- BOUNDARY LIMIT ---------- */
function applyBounds(){

  const wrapperW = wrapper.clientWidth;
  const wrapperH = wrapper.clientHeight;

  const imgW = img.clientWidth * scale;
  const imgH = img.clientHeight * scale;

  /* ---- HORIZONTAL ---- */
  if(imgW <= wrapperW){
    translateX = (wrapperW - imgW) / 2;
  } else {
    const minX = wrapperW - imgW;
    if(translateX > 0) translateX = 0;
    if(translateX < minX) translateX = minX;
  }

  /* ---- VERTICAL ---- */
  if(imgH <= wrapperH){
    translateY = (wrapperH - imgH) / 2;
  } else {
    const minY = wrapperH - imgH;
    if(translateY > 0) translateY = 0;
    if(translateY < minY) translateY = minY;
  }
}


/* ---------- PINCH DISTANCE ---------- */
function getDistance(touches){
  let dx = touches[0].clientX - touches[1].clientX;
  let dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx*dx + dy*dy);
}

/* ---------- TOUCH START ---------- */
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

/* ---------- TOUCH MOVE ---------- */
wrapper.addEventListener("touchmove", function(e){

  e.preventDefault();

  /* PINCH ZOOM */
  if(e.touches.length === 2){

    let newDistance = getDistance(e.touches);
    let zoomFactor = newDistance / startDistance;

    let newScale = startScale * zoomFactor;

    if(newScale < 1) newScale = 1;
    if(newScale > 6) newScale = 6;

    const rect = wrapper.getBoundingClientRect();
    const pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX)/2 - rect.left;
    const pinchCenterY = (e.touches[0].clientY + e.touches[1].clientY)/2 - rect.top;

    translateX = pinchCenterX - (pinchCenterX - translateX) * (newScale/scale);
    translateY = pinchCenterY - (pinchCenterY - translateY) * (newScale/scale);

    scale = newScale;

    applyBounds();
    updateTransform();
  }

  /* DRAG */
  if(e.touches.length === 1 && isDragging){

    let dx = e.touches[0].clientX - lastTouchX;
    let dy = e.touches[0].clientY - lastTouchY;

    translateX += dx;
    translateY += dy;

    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;

    applyBounds();
    updateTransform();
  }

});

/* ---------- TOUCH END ---------- */
wrapper.addEventListener("touchend", function(){
  isDragging = false;
});

/* ---------- LOAD ---------- */
img.onload = function(){

  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  overlay.setAttribute("viewBox","0 0 "+naturalW+" "+naturalH);

  hazardData.forEach(state=>{
    if(!state.coordinates?.length) return;

    const pts = state.coordinates
      .map(p=>p[0]+","+p[1])
      .join(" ");

    const poly =
      document.createElementNS("http://www.w3.org/2000/svg","polygon");

    poly.setAttribute("points", pts);
    poly.setAttribute("fill",
      state.severity==="High" ? "rgba(255,0,0,.45)" :
      state.severity==="Medium" ? "rgba(255,165,0,.45)" :
      "rgba(0,200,0,.4)"
    );

    poly.onclick=()=>{
      window.ReactNativeWebView.postMessage(
        JSON.stringify({state_id: state.state_id})
      );
    };

    overlay.appendChild(poly);
  });

  if(!userLatLng) return;

  const renderedW = img.clientWidth;
  const renderedH = img.clientHeight;

  let x =
    ((userLatLng.longitude-INDIA_BOUNDS.minLng)/
    (INDIA_BOUNDS.maxLng-INDIA_BOUNDS.minLng))*renderedW;

  let y =
    ((INDIA_BOUNDS.maxLat-userLatLng.latitude)/
    (INDIA_BOUNDS.maxLat-INDIA_BOUNDS.minLat))*renderedH;

  userDot.style.left = x + "px";
  userDot.style.top  = y + "px";
  userDot.style.display = "block";

  /* AUTO CENTER */
  scale = 2;

  translateX = wrapper.clientWidth/2 - x*scale;
  translateY = wrapper.clientHeight/2 - y*scale;

  applyBounds();
  updateTransform();
};

</script>
</body>
</html>
`;

  /* =====================================================
     RENDER
===================================================== */

  return (
    <AppLayout
      title="Earthquake Hazard"
      subtitle="India"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showBack
      showLogo
    >
      <View style={{ flex: 1 }}>
        <WebView
          key={JSON.stringify(userLatLng)}
          ref={webViewRef}
          source={{ html }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
        />
      </View>
    </AppLayout>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
