import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Linking,
  Alert,
} from "react-native";
import Pdf from "react-native-pdf";
import AppLayout from "../components/AppLayout";
//import Icon from "react-native-vector-icons/MaterialIcons";

export default function PdfViewerScreen({ route, navigation }: any) {
  const { pdfUrl, title } = route.params;
  const [loading, setLoading] = useState(true);

  const downloadPdf = async () => {
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (!supported) {
        Alert.alert("Error", "Cannot open this file");
        return;
      }
      await Linking.openURL(pdfUrl);
    } catch (err) {
      console.log("Download error:", err);
      Alert.alert("Error", "Failed to download PDF");
    }
  };

  return (
    <AppLayout
      title="Earthquake Hazard"
      subtitle={title || "District Report"}
      showBack
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>

        {/* Small floating download icon */}
        <TouchableOpacity style={styles.iconBtn} onPress={downloadPdf}>
         {/*<Icon name="download" size={18} color="#fff" />*/}
        </TouchableOpacity>

        {/* Loader */}
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#6f8f55" />
          </View>
        )}

        {/* PDF Viewer */}
       <Pdf
         source={{
           uri: encodeURI(pdfUrl),
           cache: true,
           method: 'GET',
         }}
         trustAllCerts={false}
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

  /* ---- Small round download icon ---- */
  iconBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#6f8f55",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  icon: {
    fontSize: 18,
  },
});
