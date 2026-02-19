import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  ScrollView,
  Linking,
  Pressable,
} from "react-native";
import { WebView } from "react-native-webview";
import AppLayout from "../components/AppLayout";

export default function ContentScreen({ route, navigation }: any) {
  const pageName = route?.params?.pageName || "";

  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (pageName) fetchContent();
  }, [pageName]);

  const fetchContent = async () => {
    try {
      const res = await fetch(
        "http://49.50.117.186/api/mobile-app-content"
      );

      const json = await res.json();

      const found = json?.data?.find(
        (item: any) => item.page_name === pageName
      );

      if (found) {
        setTitle(found.title || "");
        setContent(found.content || "");
        setAttachment(found.attachment || "");
      }

      setLoading(false);
    } catch (error) {
      console.log("API Error:", error);
      setLoading(false);
    }
  };

  /* ---------- helpers ---------- */

  const isImage = attachment?.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = attachment?.match(/\.pdf$/i);

  return (
    <AppLayout
      title={title || pageName}
      showBack
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#6f8f55"
            style={{ marginTop: 20 }}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            nestedScrollEnabled
          >
           {/* ---------- IMAGE ---------- */}
           {isImage && (
             <Image
               source={{ uri: attachment }}
               style={imageLoaded ? styles.image : { width: 0, height: 0 }}
               resizeMode="contain"
               onLoad={() => setImageLoaded(true)}
               onError={() => setImageLoaded(false)}
             />
           )}


            {/* ---------- PDF ---------- */}
            {isPdf && (
              <Pressable
                style={styles.pdfBtn}
                onPress={() => Linking.openURL(attachment)}
              >
                <Text style={styles.pdfText}>
                  Open PDF Attachment
                </Text>
              </Pressable>
            )}

            {/* ---------- HTML CONTENT ---------- */}
            {!!content && (
              <View style={styles.webviewWrapper}>
                <WebView
                  originWhitelist={["*"]}
                  nestedScrollEnabled
                  source={{
                    html: `
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                          <style>
                            body { font-size:16px; padding:10px; }
                            img { max-width:100%; height:auto; }
                          </style>
                        </head>
                        <body>${content}</body>
                      </html>
                    `,
                  }}
                />
              </View>
            )}

            {!content && !attachment && (
              <Text style={styles.noData}>
                No content available
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </AppLayout>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scroll: {
    padding: 12,
    paddingBottom: 40,
  },

  image: {
    width: "100%",
    height: 250,
    marginBottom: 12,
  },

  webviewWrapper: {
    height: 600, // required for WebView inside ScrollView
  },

  pdfBtn: {
    backgroundColor: "#6f8f55",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },

  pdfText: {
    color: "#fff",
    fontWeight: "600",
  },

  noData: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});
