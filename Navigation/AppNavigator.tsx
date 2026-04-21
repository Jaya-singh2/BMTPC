import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";

/* ---------------- SCREENS ---------------- */

import HomeScreen from "../screens/HomeScreen";
import EarthquakeHazardScreen from "../screens/EarthquakeHazardScreen";
import StateDetailScreen from "../screens/StateDetailScreen";
import PdfViewerScreen from "../screens/PdfViewerScreen";
import ContentScreen from "../screens/ContentScreen";
import VulnerabilityRiskScreen from "../screens/VulnerabilityRiskScreen";
import FeedbackScreen from "../screens/FeedbackScreen";

/* ---------------- NAVIGATORS ---------------- */

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

/* =========================================================
   🔥 SPLASH SCREEN (FULLSCREEN FIXED)
========================================================= */

function SplashScreen({ navigation }: any) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("MainApp");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splashContainer}>

      {/* ✅ Hide status bar completely */}
      <StatusBar hidden={true} translucent={true} />

      <Image
        source={require("../assets/splash.png")}
        style={styles.splashImage}
        resizeMode="stretch" // ✅ IMPORTANT (no white space)
      />
    </View>
  );
}

/* =========================================================
   MAIN STACK
========================================================= */

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="EarthquakeHazardScreen" component={EarthquakeHazardScreen} />
      <Stack.Screen name="StateDetail" component={StateDetailScreen} />
      <Stack.Screen name="PdfViewerScreen" component={PdfViewerScreen} />
      <Stack.Screen name="ContentScreen" component={ContentScreen} />
      <Stack.Screen name="VulnerabilityRiskScreen" component={VulnerabilityRiskScreen} />
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
    </Stack.Navigator>
  );
}

/* =========================================================
   DRAWER
========================================================= */

type MenuButtonProps = {
  label: string;
  icon: string;
  onPress: () => void;
  showArrow?: boolean;
  isOpen?: boolean;
  active?: boolean;
};

const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  icon,
  onPress,
  showArrow = false,
  isOpen = false,
  active = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.menuBtn, active && styles.activeMenuBtn]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={20} color="#222" />
        <Text style={styles.menuText}>{label}</Text>
      </View>

      {showArrow && (
        <Ionicons
          name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
          size={20}
          color="#222"
        />
      )}
    </TouchableOpacity>
  );
};

function CustomDrawerContent(props: any) {
  const { navigation } = props;

  const [homeOpen, setHomeOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  return (
    <View style={styles.drawerContainer}>

      {/* HEADER */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderTitle}>Menu</Text>

        <TouchableOpacity onPress={() => navigation.closeDrawer()}>
          <Ionicons name="close-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View style={styles.drawerBody}>

        <MenuButton
          label="Home"
          icon="home-outline"
          showArrow
          isOpen={homeOpen}
          active={activeItem === "Home"}
          onPress={() => {
            setHomeOpen(!homeOpen);
            setActiveItem("Home");
          }}
        />

        {homeOpen && (
          <View style={{ marginLeft: 10 }}>

            <MenuButton
              label="Hazards"
              icon="warning-outline"
              onPress={() => {
                navigation.navigate("MainApp", {
                  screen: "HomeMain",
                  params: { tab: "hazards" },
                });
              }}
            />

            <MenuButton
              label="About Us"
              icon="document-text-outline"
              onPress={() => {
                navigation.navigate("MainApp", {
                  screen: "HomeMain",
                  params: { tab: "about" },
                });
              }}
            />

          </View>
        )}

        <MenuButton
          label="Share"
          icon="share-social-outline"
          onPress={() => Alert.alert("Share", "Not implemented")}
        />

        <MenuButton
          label="Exit"
          icon="log-out-outline"
          onPress={() => Alert.alert("Exit", "Not implemented")}
        />

      </View>
    </View>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerPosition="right"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        drawerType: "front",
        overlayColor: "rgba(0,0,0,0.25)",
        drawerStyle: {
          width: "92%",
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      <Drawer.Screen name="MainApp" component={MainStack} />
    </Drawer.Navigator>
  );
}

/* =========================================================
   ROOT STACK
========================================================= */

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MainApp" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  splashContainer: {
    flex: 1,
    backgroundColor: "#88A96B",
  },

  splashImage: {
    width: "100%",
    height: "100%",
  },

  drawerContainer: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },

  drawerHeader: {
    height: 180,
    backgroundColor: "#88A96B",
    paddingHorizontal: 24,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  drawerHeaderTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  drawerBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  menuBtn: {
    minHeight: 46,
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
  },

  activeMenuBtn: {
    backgroundColor: "#e6e6e6",
    borderColor: "#000",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

});