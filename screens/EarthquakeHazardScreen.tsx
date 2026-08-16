import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
  Pressable
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Geolocation from "react-native-geolocation-service";
import AppLayout from "../components/AppLayout";

const MAP_CONFIG = {
  "Earthquake Hazard": {
    minLat: 6.4627,
    maxLat: 37.4841,
    minLng: 68.1097,
    maxLng: 97.3956,
  },

  "Wind Hazard": {
    minLat: 6.4627,
     maxLat: 40.2000,
     minLng: 67.6000,
      maxLng: 94.4000
  },

  "Flood Hazard": {
   minLat: 6.4627,
       maxLat: 39.5990,
       minLng: 67.9000,
        maxLng: 91.0956
  },

  "Landslide Incidence Map": {
      minLat: 6.4627,
     maxLat: 38.7200,
     minLng: 67.6000,
      maxLng: 94.0056
  },

  "Thunderstorm Incidence Map": {
   minLat: 6.4627,
       maxLat: 40.4000,
       minLng: 68.2000,
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

  const API_URL = `https://vai.bmtpc.netcreativemind.com/api/v1/hazard-state-assembly-coordinates?hazard_id=${hazardId}`;

  const PAGE_NAME = route?.params?.pageName;
  const PDF_MAP = {
    "Earthquake Hazard":  "bundle-assets://pdfs/Earthquakes.pdf",
    "Wind Hazard": "bundle-assets://pdfs/Wind.pdf",
    "Flood Hazard": "bundle-assets://pdfs/Floods.pdf",
    "Landslide Incidence Map": "bundle-assets://pdfs/Landslides.pdf",
    "Thunderstorm Incidence Map": "bundle-assets://pdfs/Thunderstorm.pdf",
  };

  const webViewRef = useRef<WebView>(null);

  const [hazardData, setHazardData] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const [userLatLng, setUserLatLng] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [zoneInfo, setZoneInfo] = useState<any>(null);

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
        }else {
                 const auth = await Geolocation.requestAuthorization("whenInUse");
                 if (auth !== "granted") {
                   setLocationLoading(false);
                   return;
                 }
               }
 Geolocation.getCurrentPosition(
   async (pos) => {
       console.log("Inside getCurrentPosition");

        // Test location
        //const latitude = 23.009472825540964;
       // const longitude = 71.9179438909462;

       const latitude = pos.coords.latitude;
       const longitude = pos.coords.longitude;

        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

     setUserLatLng({
       latitude,
       longitude,
     });

     try {
          console.log("Calling Nominatim...");
       const response = await fetch(
         `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
         {
           headers: {
             "User-Agent": "HazardApp/1.0",
           },
         }
       );

       const json = await response.json();
        console.log(json)
       const state =
         json.address?.state ||
         json.address?.state_district ||
             json.address?.city ||
         "";

       let normalizedState = state;

       if (
         normalizedState === "New Delhi" ||
         normalizedState === "National Capital Territory of Delhi" ||
         normalizedState === "NCT of Delhi" ||
         normalizedState === "Delhi Division"
       ) {
         normalizedState = "Delhi";
       }

       setUserState(normalizedState);

       console.log("Detected State:", normalizedState);

     } catch (e) {
       console.log(e);
     }

     setLocationLoading(false);
   },
   (error) => {
     console.log(error);
     setLocationLoading(false);
   },
   {
     enableHighAccuracy: true,
   }
 );
      } catch {
        setLocationLoading(false);
      }
    };

    getLocation();
  }, []);



 {/*const openPdf = async() => {
try {
      if (!hazardId) {
        Alert.alert("Error", "Invalid hazard id");
        return;
      }

      const response = await fetch(
        "https://vai.bmtpc.netcreativemind.com/api/v1/hazards/risk-pdf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
                    hazard_id: hazardId,
              }),
        }
      );

      const json = await response.json();
      console.log(json,"risk table",hazardId)
      if (!json?.data[0].risk_pdf) {
        Alert.alert("Error", "PDF not available");
        return;
      }

      navigation.navigate("PdfViewerScreen", {
        pdfUrl: json?.data[0].risk_pdf,
        title: "INDIA",
        PAGE_NAME,
        hazardId:hazardId
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to open PDF");
    }
}; */}

  /* ================= MESSAGE ================= */

  const onMessage = async(event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "DOT_DEBUG") {
        console.log("DOT DEBUG:", data);
        return;
      }
if (data.type === "USER_LOCATION") {
    try {

        if (!userLatLng) {
            console.log("User location not available");
            return;
        }

     const response = await fetch(
     `https://vai.bmtpc.netcreativemind.com/api/v1/zone-coordonates?hazard_id=${hazardId}&latitude=${userLatLng.latitude}&longitude=${userLatLng.longitude}&state_id=${data.state_id}`,
     {
     method:"POST"
     }
     );
     const json = await response.json();

     if (!json.status || !json.current_coords) {
         console.log("Invalid API response", json);
         return;
     }

     const coords = json.current_coords;

     webViewRef.current?.injectJavaScript(`
     window.updateUserMarker(
     ${coords[0]},
     ${coords[1]},
     ${JSON.stringify(json)}
     );
     true;
     `);

        console.log("Zone API:", json);

        setZoneInfo(json);

    } catch (e) {

        console.log("Zone API Error", e);

    }

    return;
}
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
          pageName: PAGE_NAME,
               hazardId:hazardId
        });
      }
    } catch {}
  };

  /* ================= HTML ================= */
  console.log("Creating HTML");
  console.log("userState =", userState);
  console.log("hazardData length =", hazardData.length);
console.log("USER_STATE:", userState);
console.log("hazardData Length:", hazardData.length);


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
#zoneLabel{
    position:absolute;
    left:0;
    top:0;

    background: rgba(255,255,255,0.5);
    color:#cc0000;

    padding:8px 12px;
    border-radius:8px;

    font-size:14px;
    font-weight:bold;
    line-height:20px;

    text-align:center;

    max-width:180px;      /* adjust if required */
    width:max-content;

    white-space:normal;   /* Allow multiple lines */
    word-break:break-word;
    overflow-wrap:break-word;

    transform:translate(-50%,0);

    pointer-events:none;
    z-index:9999;

    box-shadow:0 2px 8px rgba(0,0,0,.25);

    animation:blink 2s infinite;
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
const USER_STATE = ${JSON.stringify(userState)};
let zoneApiResponse = null;
const INDIA_BOUNDS = MAP_CONFIG[PAGE_NAME] || MAP_CONFIG["Earthquake Hazard"];

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


window.updateUserMarker = function(imageX,imageY,zone){

    const scaleX = img.clientWidth / img.naturalWidth;
    const scaleY = img.clientHeight / img.naturalHeight;

    const dotX = imageX * scaleX;
    const dotY = imageY * scaleY;

    userDot.style.left = dotX + "px";
    userDot.style.top = dotY + "px";
    userDot.style.display = "block";

    x = dotX;
    y = dotY;

    if (
        zone &&
        zone.status === true &&
        zone.zone_name &&
        zone.zone_name.trim() !== ""
    ) {

        const zoneText = zone.zone_name
            .replace("(", "<br>(")
            .replace(" Zone-", " Zone-<br>");

        zoneLabel.innerHTML =
            '<div style="color:#cc0000;">You are in</div>' +
            '<div style="color:#cc0000;font-weight:bold;">' +
            zoneText +
            '</div>';

        zoneLabel.style.display = "block";

    } else {

        zoneLabel.innerHTML = "";
        zoneLabel.style.display = "none";
    }

    scale = 3;

    translateX = wrapper.clientWidth/2 - x*scale;
    translateY = wrapper.clientHeight/2 - y*scale;

    updateTransform();
};

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

if(USER_STATE){

    const state = hazardData.find(s=>{

        return (
            s.state_name.toLowerCase().trim() ===
            USER_STATE.toLowerCase().trim()
        );

    });
console.log("USER_STATE", USER_STATE);
console.log(
  "Available States",
  hazardData.map(s => s.state_name)
);
console.log("Matched State", state);

    if(state){

     window.ReactNativeWebView.postMessage(
     JSON.stringify({
         type:"USER_LOCATION",
         state_id:state.state_id
     })
     );

    }

}

  window.ReactNativeWebView.postMessage(JSON.stringify({type:"MAP_READY"}));

};

</script>

</body>
</html>
`;

  return (
    <AppLayout
     title={PAGE_NAME}
     subtitle="India"
     showBack
     showLogo
    >

         {/*rightComponent={
            <Pressable onPress={openPdf}>
              <Icon name="visibility" size={24} color="#fff" />
            </Pressable>
          }*/}
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
floatingIcon: {
  position: "absolute",
  top: -15,
  right: 15,   // ✅ sticks to right side
  zIndex: 999,
}
});