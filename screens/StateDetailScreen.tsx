import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import AppLayout from "../components/AppLayout";

/* ---------------- TYPES ---------------- */

interface District {
  district_id: number;
  district_name: string;
  severity: "Low" | "Medium" | "High";
  coordinates: { x: number; y: number }[];
}

interface ApiResponse {
  status: boolean;
  data: District[];
}

interface HazardState {
  state_id: number;
  state_name: string;
  image: string;
}

type Screen = "hazards" | "about" | "feedback";

/* ---------------- SCREEN ---------------- */

export default function StateDistrictHazardScreen({
  route,
  navigation,
}: any) {
  const [activeTab, setActiveTab] = useState<Screen>("hazards");
  const webViewRef = useRef<WebView>(null);

  const stateData: HazardState | undefined = route?.params?.stateData;
  const PAGE_NAME = route?.params?.pageName;
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH DISTRICTS ---------------- */

  useEffect(() => {
    if (!stateData) {
      setLoading(false);
      return;
    }

    fetch(
      `http://49.50.117.186/api/hazard-district?hazard_id=1&state_id=${stateData.state_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then(res => res.json())
      .then((json: ApiResponse) => {
        setDistricts(json?.data || []);
        console.log(json, "states")
      })
      .catch(() => setDistricts([]))
      .finally(() => setLoading(false));
  }, [stateData]);

  /* ---------------- HANDLE DISTRICT CLICK ---------------- */

  const onMessage = async (event: any) => {
    try {
      const { district_id } = JSON.parse(event.nativeEvent.data);

      if (!district_id || !stateData) {
        Alert.alert("Error", "Invalid district");
        return;
      }

      /* --- call POST api to get pdf_url --- */

      const response = await fetch(
        "http://49.50.117.186/api/hazard-district/pdf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            district_id,
            hazard_id: 1,
            state_id: stateData.state_id,
          }),
        }
      );

      const json = await response.json();

      if (!json?.pdf_url) {
        Alert.alert("Error", "PDF not available");
        return;
      }

      /* --- navigate INSIDE app --- */

      navigation.navigate("PdfViewerScreen", {
        pdfUrl: json.pdf_url,
        title: json.district_name || "District Report",
        PAGE_NAME

      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to open PDF");
    }
  };

  /* ---------------- LOADER ---------------- */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6f8f55" />
      </View>
    );
  }

  /* ---------------- WEBVIEW HTML ---------------- */

 const html = `
 <!DOCTYPE html>
 <html>
 <head>
 <meta name="viewport"
 content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

 <style>
 html, body {
   margin:0;
   padding:0;
   overflow:hidden;
   background:#fff;
   touch-action:none;
 }
* {
  -webkit-tap-highlight-color: transparent;
}


 #wrapper {
   position:relative;
   width:100vw;
   height:100vh;
   overflow:hidden;
 }

 #mapLayer {
   position:absolute;
   top:0;
   left:0;
   transform-origin:0 0;
 }

 #map {
   width:100vw;
   height:auto;
   display:block;
 }

 #overlay {
   position:absolute;
   top:0;
   left:0;
   width:100%;
   height:100%;
 }

 polygon {
   fill:transparent;
   stroke:none;
   stroke-width:1;
   cursor:pointer;
 }
 /*polygon:hover {
   fill:rgba(255,0,0,.5);
 }*/
 </style>
 </head>

 <body>

 <div id="wrapper">
   <div id="mapLayer">
     <img id="map" src="${stateData?.image || ""}" />
     <svg id="overlay"></svg>
   </div>
 </div>

 <script>
 (function () {

   const districts = ${JSON.stringify(districts)};
   const img = document.getElementById("map");
   const svg = document.getElementById("overlay");
   const mapLayer = document.getElementById("mapLayer");
   const wrapper = document.getElementById("wrapper");

   let scale = 1;
   let translateX = 0;
   let translateY = 0;

   let startDistance = 0;
   let startScale = 1;
   let lastTouchX = 0;
   let lastTouchY = 0;
   let isDragging = false;

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

   function updateTransform(){
     applyBounds();
     mapLayer.style.transform =
       "translate(" + translateX + "px," + translateY + "px) scale(" + scale + ")";
   }

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

   img.onload = function () {

     const naturalW = img.naturalWidth;
     const naturalH = img.naturalHeight;

     svg.setAttribute("viewBox", "0 0 " + naturalW + " " + naturalH);

     districts.forEach(d => {
       if (!d.coordinates?.length) return;

       const points = d.coordinates
         .map(p => p.x + "," + p.y)
         .join(" ");

       const polygon = document.createElementNS(
         "http://www.w3.org/2000/svg",
         "polygon"
       );

       polygon.setAttribute("points", points);

       polygon.onclick = function () {
         window.ReactNativeWebView.postMessage(
           JSON.stringify({ district_id: d.district_id })
         );
       };

       svg.appendChild(polygon);
     });

     updateTransform();
   };

 })();
 </script>

 </body>
 </html>
 `;


  /* ---------------- RENDER ---------------- */

  return (
    <AppLayout
      title={PAGE_NAME}
      subtitle={stateData?.state_name || ""}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showBack
      showLogo
    >
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ html }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
          style={{ flex: 1 }}
        />
      </View>
    </AppLayout>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
