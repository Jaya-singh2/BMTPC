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
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  html, body {
    margin:0;
    padding:0;
    width:100%;
    height:100%;
    overflow:hidden;
    background:#fff;
  }

  #container {
    width:100%;
    height:100%;
    display:flex;
    justify-content:center;
    align-items:center;
  }

  #wrapper {
    position:relative;
  }

  #map {
    max-width:100%;
    max-height:100%;
    display:block;
  }

  #overlay {
    position:absolute;
    top:0;
    left:0;
  }

  polygon {
    fill:rgba(0,200,0,.45);
    stroke:#006400;
    stroke-width:1;
    cursor:pointer;
  }

  polygon:hover {
    fill:rgba(255,0,0,.5);
  }
</style>
</head>

<body>
<div id="container">
  <div id="wrapper">
    <img id="map" src="${stateData?.image || ""}" />
    <svg id="overlay"></svg>
  </div>
</div>

<script>
(function () {
  const districts = ${JSON.stringify(districts)};
  const img = document.getElementById("map");
  const svg = document.getElementById("overlay");

  img.onload = function () {
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const renderedW = img.clientWidth;
    const renderedH = img.clientHeight;

    svg.setAttribute("width", renderedW);
    svg.setAttribute("height", renderedH);
    svg.setAttribute("viewBox", "0 0 " + naturalW + " " + naturalH);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

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
  };
})();
</script>
</body>
</html>
`;

  /* ---------------- RENDER ---------------- */

  return (
    <AppLayout
      title="Earthquake Hazard"
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
