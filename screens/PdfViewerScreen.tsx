
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  Pressable,
} from "react-native";

import Pdf from "react-native-pdf";
import AppLayout from "../components/AppLayout";
import Icon from "react-native-vector-icons/MaterialIcons";
import ReactNativeBlobUtil from "react-native-blob-util";

export default function PdfViewerScreen({ route, navigation }: any) {
  const {
    pdfUrl: initialPdfUrl,
    title,
    PAGE_NAME,
    hazardId,
  } = route.params;

  // Currently displayed PDF
  const [currentPdfUrl, setCurrentPdfUrl] = useState(initialPdfUrl);

  // PDF loading state
  const [loading, setLoading] = useState(true);

  // Used to identify whether PDF 2 is already opened
  const [isSecondPdf, setIsSecondPdf] = useState(false);

  console.log("Hazard ID:", hazardId);
  console.log("Current PDF:", currentPdfUrl);

  /**
   * ---------------------------------------------------------
   * DOWNLOAD CURRENT PDF
   * ---------------------------------------------------------
   */
  const downloadPdf = async () => {
    try {
      const { config, fs } = ReactNativeBlobUtil;

      const filePath =
        fs.dirs.DownloadDir + `/report_${Date.now()}.pdf`;

      config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: "Downloading PDF...",
          mime: "application/pdf",
          mediaScannable: true,
        },
      })
        .fetch("GET", currentPdfUrl)
        .then((res) => {
          console.log("File saved to:", res.path());

          Alert.alert(
            "Success",
            "PDF downloaded successfully"
          );
        })
        .catch((err) => {
          console.log("Download error:", err);

          Alert.alert(
            "Error",
            "Download failed"
          );
        });
    } catch (error) {
      console.log("Download error:", error);

      Alert.alert(
        "Error",
        "Something went wrong"
      );
    }
  };

  /**
   * ---------------------------------------------------------
   * OPEN SECOND PDF
   * ---------------------------------------------------------
   *
   * This PDF will open when the user taps PDF 1.
   */
  const openAnotherPdf = () => {
    // Only hazard ID 1 should have this behavior
    if (hazardId !== 1) {
      return;
    }

    // Prevent opening PDF 2 repeatedly
    if (isSecondPdf) {
      return;
    }

    console.log("Opening second PDF...");

    setLoading(true);

    setCurrentPdfUrl(
      "https://vai.bmtpc.netcreativemind.com/assets/uploads/pdf/hazard_pdf/EQ_Resistant_Features.pdf"
    );

    setIsSecondPdf(true);
  };

  /**
   * ---------------------------------------------------------
   * INFO BUTTON
   * ---------------------------------------------------------
   *
   * Existing API functionality.
   */
  const openPdf = async () => {
    try {
      if (!hazardId) {
        Alert.alert(
          "Error",
          "Invalid hazard id"
        );
        return;
      }

      const response = await fetch(
        "https://vai.bmtpc.netcreativemind.com/api/v1/hazards/risk-pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hazard_id: hazardId,
          }),
        }
      );

      const json = await response.json();

      console.log(
        json,
        "risk table"
      );

      if (!json?.data?.[0]?.risk_pdf) {
        Alert.alert(
          "Error",
          "PDF not available"
        );
        return;
      }

      setLoading(true);

      setCurrentPdfUrl(
        json.data[0].risk_pdf
      );

      // If this is treated as another PDF,
      // remove the PDF 1 click behavior.
      setIsSecondPdf(true);

    } catch (error) {
      console.error(
        "Open PDF error:",
        error
      );

      Alert.alert(
        "Error",
        "Failed to open PDF"
      );
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

        {/* =====================================================
            PDF CONTAINER
        ===================================================== */}
        <View style={styles.pdfContainer}>

          {/* =================================================
              PDF VIEWER
          ================================================= */}
          <Pdf
            source={{
              uri: encodeURI(
                currentPdfUrl
              ),
              cache: true,
              method: "GET",
            }}
            trustAllCerts={false}
            style={styles.pdf}

            onLoadComplete={() => {
              console.log(
                "PDF loaded successfully"
              );

              setLoading(false);
            }}

            onError={(err) => {
              console.log(
                "PDF Error:",
                err
              );

              setLoading(false);

              Alert.alert(
                "Error",
                "Failed to load PDF"
              );
            }}
          />

          {/* =================================================
              PDF 1 TAP AREA

              This exists ONLY before PDF 2 is opened.
          ================================================= */}
          {hazardId === 1 &&
            !isSecondPdf && (
              <Pressable
                style={
                  styles.pdfTouchLayer
                }
                onPress={
                  openAnotherPdf
                }
              />
            )}

          {/* =================================================
              LOADER
          ================================================= */}
          {loading && (
            <View
              style={styles.loader}
            >
              <ActivityIndicator
                size="large"
                color="#6f8f55"
              />
            </View>
          )}

        </View>

        {/* =====================================================
            FLOATING BUTTONS
        ===================================================== */}
        <View
          style={
            styles.iconContainer
          }
        >

          {/* =================================================
              DOWNLOAD BUTTON
          ================================================= */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                marginRight: 10,
              },
            ]}
            onPress={
              downloadPdf
            }
          >
            <Icon
              name="download"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

          {/* =================================================
              INFO BUTTON
          ================================================= */}
          <TouchableOpacity
            style={
              styles.iconBtn
            }
            onPress={
              openPdf
            }
          >
            <Icon
              name="info-outline"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

        </View>

      </View>
    </AppLayout>
  );
}

/**
 * =============================================================
 * STYLES
 * =============================================================
 */

const styles = StyleSheet.create({

  /**
   * Main screen
   */
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /**
   * PDF container
   */
  pdfContainer: {
    flex: 1,
    position: "relative",
  },

  /**
   * PDF viewer
   */
  pdf: {
    flex: 1,
    width: "100%",
  },

  /**
   * Transparent layer above PDF 1
   *
   * It is removed after PDF 2 opens.
   */
  pdfTouchLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 500,
  },

  /**
   * Loading overlay
   */
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 3000,
  },

  /**
   * Floating buttons
   */
  iconContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",

    // Must be higher than pdfTouchLayer
    zIndex: 2000,
    elevation: 20,
  },

  /**
   * Round icon button
   */
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FDC08A",

    justifyContent: "center",
    alignItems: "center",

    elevation: 5,
  },

  /**
   * Optional icon style
   */
  icon: {
    fontSize: 18,
  },
});

