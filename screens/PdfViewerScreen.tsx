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
import Icon from "react-native-vector-icons/MaterialIcons";
import ReactNativeBlobUtil from 'react-native-blob-util';

export default function PdfViewerScreen({ route, navigation }: any) {
  const { pdfUrl, title , PAGE_NAME} = route.params;
  const [loading, setLoading] = useState(true);

const downloadPdf = async () => {
  try {
    const { config, fs } = ReactNativeBlobUtil;

    const filePath = fs.dirs.DownloadDir + `/report_${Date.now()}.pdf`;

    config({
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: filePath,
        description: 'Downloading PDF...',
        mime: 'application/pdf',
        mediaScannable: true,
      },
    })
      .fetch('GET', pdfUrl)
      .then((res) => {
        Alert.alert('Success', 'PDF downloaded successfully');
        console.log('File saved to:', res.path());
      })
      .catch((err) => {
        console.log(err);
        Alert.alert('Error', 'Download failed');
      });

  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Something went wrong');
  }
};


  return (
    <AppLayout
      title={PAGE_NAME}
      subtitle={title || "District Report"}
      showBack
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>

        {/* Small floating download icon */}
        <TouchableOpacity style={styles.iconBtn} onPress={downloadPdf}>
         <Icon name="download" size={18} color="#fff" />
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
