import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import AppLayout from "../components/AppLayout";
import HazardCard from "../components/HazardCard";
import AboutUsCard from "../components/AboutUsCard";

import { hazards } from "../data/HomeData";

type Screen = "hazards" | "about";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<Screen>("hazards");

  const [aboutData, setAboutData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- API CALL ---------------- */
  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const res = await fetch(
        "http://49.50.117.186/api/mobile-app-content"
      );

      const json = await res.json();

      setAboutData(json?.data || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  /* ---------------- DATA SWITCH ---------------- */
  const currentData =
    activeTab === "hazards" ? hazards : aboutData;

  const CardComponent =
    activeTab === "hazards" ? HazardCard : AboutUsCard;

  /* ---------------- NAVIGATION FIX ---------------- */
  const handlePress = (item: any) => {
    if (activeTab === "hazards" && item.screen) {
      //  open hazard specific screen
      navigation.push(item.screen, {
          pageName: item.page_name || item.title,
           });
    } else {
      //  open API content screen
        navigation.push("ContentScreen", {
        pageName: item.title,
      });
    }
  };

  return (
    <AppLayout
      title="Vulnerability Atlas of India"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showBack={false}
      showLogo
    >
      {/* ---------- Tabs ---------- */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabs}>
          {(["hazards", "about"] as Screen[]).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={
                  activeTab === tab
                    ? styles.activeText
                    : styles.inactiveText
                }
              >
                {tab === "hazards" ? "Hazards" : "About Us"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ---------- Content ---------- */}
      {loading && activeTab === "about" ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.heading}>
            {activeTab === "hazards"
              ? "Hazards"
              : "About Us"}
          </Text>

          <View style={styles.grid}>
            {currentData.map((item) => (
              <CardComponent
                key={item.id || item.title}
                title={item.title}
                icon={
                  item.icon ||
                  require("../assets/images/about/atlas.png")
                }
                onPress={() => handlePress(item)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </AppLayout>
  );
};

export default HomeScreen;


/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  tabsWrapper: {
    paddingHorizontal: 16,
    marginTop: 5,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#c8dbb3",
    borderRadius: 10,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#6e875a",
  },

  activeText: {
    fontWeight: "900",
    color: "#fff",
  },

  inactiveText: {
    fontWeight: "900",
    color: "#000",
  },

  content: {
    paddingTop: 16,
    paddingBottom: 100,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});
