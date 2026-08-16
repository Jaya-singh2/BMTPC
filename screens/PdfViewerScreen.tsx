import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Linking,
  Alert,
  Pressable
} from "react-native";
import Pdf from "react-native-pdf";
import AppLayout from "../components/AppLayout";
import Icon from "react-native-vector-icons/MaterialIcons";
import ReactNativeBlobUtil from 'react-native-blob-util';

export default function PdfViewerScreen({ route, navigation }: any) {
  const { pdfUrl, title , PAGE_NAME, hazardId} = route.params;
  const [loading, setLoading] = useState(true);
  console.log(hazardId, 'id')

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

const openPdf = async() => {
try {
      if (!hazardId) {
        Alert.alert("Error", "Invalid hazard id");
        return;
      }

      /* --- call POST api to get pdf_url --- */

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
      console.log(json,"risk table")
      if (!json?.data[0].risk_pdf) {
        Alert.alert("Error", "PDF not available");
        return;
      }

      /* --- navigate INSIDE app --- */
      navigation.navigate("PdfViewerScreen", {
        pdfUrl: json?.data[0].risk_pdf,
        title: "INDIA",
        PAGE_NAME,
        hazardId,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to open PDF");
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

       {/* Floating icons */}
       <View style={styles.iconContainer}>


         {/* Download Icon */}
         <TouchableOpacity style={[styles.iconBtn, { marginRight: 10 }]} onPress={downloadPdf}>
           <Icon name="download" size={18} color="#fff" />
         </TouchableOpacity>

             {/* Info Icon */}
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={openPdf}
                  >
                    <Icon name="info-outline" size={18} color="#fff" />
                  </TouchableOpacity>
       </View>

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
           method: "GET",
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
  iconContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    zIndex: 1000,
  },
  /* ---- Small round download icon ---- */
   iconBtn: {
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: "#FDC08A",
     justifyContent: "center",
     alignItems: "center",
     elevation: 5,
   },
  icon: {
    fontSize: 18,
  },
});
