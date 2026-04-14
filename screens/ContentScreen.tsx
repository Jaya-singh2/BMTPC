import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import Pdf from "react-native-pdf";
import ImageZoom from "react-native-image-pan-zoom";
import AppLayout from "../components/AppLayout";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ContentScreen({ route, navigation }: any) {
  const pageName = route?.params?.pageName || "";

  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState("");
  const [title, setTitle] = useState("");
  const [imageSize, setImageSize] = useState({
    width: screenWidth - 24,
    height: 220,
  });
  const [imageLoading, setImageLoading] = useState(false);
const [pdfError, setPdfError] = useState(false);
  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "http://49.50.117.186/api/mobile-app-content"
        );
        const json = await res.json();
        console.log(json,'json')
        const found = json?.data?.find(
          (item: any) => item.page_name === pageName
        );

        if (!isMounted) return;

        if (found) {
            console.log(found, 'found')
          const file = found.attachment || "";
          setTitle(found.title || "");
          setContent(found.content || "");
          setAttachment(file.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29"));

          console.log(/\.pdf$/i.test(file))
          setPdfLoading(/\.pdf$/i.test(file));

          if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
            setImageLoading(true);
            Image.getSize(
              file,
              (w, h) => {
                const maxWidth = screenWidth - 24;
                const ratio = h / w;
                setImageSize({
                  width: maxWidth,
                  height: maxWidth * ratio,
                });
                setImageLoading(false);
              },
              () => {
                setImageSize({
                  width: screenWidth - 24,
                  height: 220,
                });
                setImageLoading(false);
              }
            );
          }
        } else {
          setTitle("");
          setContent("");
          setAttachment("");
          setPdfLoading(false);
        }
      } catch (error) {
        console.log("API Error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (pageName) fetchContent();
    else setLoading(false);

    return () => {
      isMounted = false;
    };
  }, [pageName]);

  const isImage = useMemo(
    () => /\.(jpg|jpeg|png|webp)$/i.test(attachment || ""),
    [attachment]
  );
  const isPdf = useMemo(
    () => /\.pdf$/i.test(attachment || ""),
    [attachment]
  );

  const htmlContent = useMemo(() => {
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            body {
              font-size: 16px;
              padding: 12px;
              color: #222;
              line-height: 1;
              margin: 0;
              text-align: justify;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial;
            }
            p { margin-bottom: 10px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>${content || ""}</body>
      </html>
    `;
  }, [content]);

  return (
    <AppLayout
      title={title || pageName}
      showBack
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#6f8f55" />
          </View>
        ) : isPdf ? (
          // ✅ PDF FULL SCREEN (NO EXTRA SPACE)
          <View style={{ flex: 1 }}>
            {pdfLoading && (
              <ActivityIndicator
                size="large"
                color="#6f8f55"
                style={{ position: "absolute", top: "50%", left: "50%" }}
              />
            )}
              <Pdf
               source={{
                 uri: attachment,
                 cache: true,
               }}
              trustAllCerts={false}
               style={{ flex: 1, width: "100%" }}
               onLoadComplete={() => setPdfLoading(false)}
               onError={(err) => {
                 console.log(err);
                 setPdfLoading(false);
                 Alert.alert("Error", "Failed to load PDF");
               }}
             />
          </View>
        ) : (
          // ✅ NORMAL CONTENT (SCROLLABLE)
                                                                                                                                      <ScrollView
            contentContainerStyle={{ padding: 12, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* IMAGE */}
            {isImage && (
              <View style={styles.imageOuter}>
                {imageLoading ? (
                  <ActivityIndicator size="large" color="#6f8f55" />
                ) : (
                  <ImageZoom
                    cropWidth={screenWidth - 24}
                    cropHeight={Math.min(
                      imageSize.height,
                      screenHeight * 0.6
                    )}
                    imageWidth={imageSize.width}
                    imageHeight={imageSize.height}
                  >
                    <Image
                      source={{ uri: attachment }}
                      style={imageSize}
                      resizeMode="contain"
                    />
                  </ImageZoom>
                )}
              </View>
            )}

            {/* HTML CONTENT */}
            {content ? (
              <View style={styles.webviewWrapper}>
                <WebView
                  originWhitelist={["*"]}
                  source={{ html: htmlContent }}
                  style={{ height: 400 }} // dynamic feel without blank space
                  nestedScrollEnabled
                />
              </View>
            ) : !attachment ? (
              <Text style={styles.noData}>No content available</Text>
            ) : null}
          </ScrollView>
        )}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOuter: {
    width: "100%",
    minHeight: 250,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
 webviewWrapper: {
   width: "100%",
   marginBottom: 12,
   overflow: "hidden",
   flex: 1, // important
 },
  noData: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});