import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import Pdf from "react-native-pdf";
import AppLayout from "../components/AppLayout";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function LocalPdfViewerScreen({ route, navigation }: any) {
  const { pdfUrl, title, PAGE_NAME } = route.params;

  const [loading, setLoading] = useState(true);

  /* ❌ Disable download for local files */
  const downloadPdf = () => {
    Alert.alert("Info", "Download not available for local PDF");
  };

  return (
    <AppLayout
      title={PAGE_NAME}
      subtitle={title || "PDF Viewer"}
      showBack
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>

        {/* 🔽 Download Icon (optional) */}
        <TouchableOpacity style={styles.iconBtn} onPress={downloadPdf}>
          <Icon name="download" size={20} color="#FA8128" />
        </TouchableOpacity>

        {/* 🔄 Loader */}
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#6f8f55" />
          </View>
        )}

        {/* 📄 PDF VIEWER (LOCAL ONLY) */}
        <Pdf
          source={{ uri: pdfUrl, cache: false }}  // ✅ ONLY require() works here
          style={styles.pdf}
          onLoadComplete={() => setLoading(false)}
          onError={(err) => {
            console.log("PDF Error:", err);
            Alert.alert("Error", "Failed to load PDF");
          }}
        />
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  pdf: {
    flex: 1,
    width: "100%",
  },

  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 10,
  },

  /* 🔥 Orange floating icon (no button shape) */
  iconBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 999,
  },
});