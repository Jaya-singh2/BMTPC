import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/HomeScreen";
import EarthquakeHazardScreen from "../screens/EarthquakeHazardScreen";
import StateDetailScreen from "../screens/StateDetailScreen";
import PdfViewerScreen from "../screens/PdfViewerScreen";
import ContentScreen from "../screens/ContentScreen";

/* ---------------- TYPES ---------------- */

type StackParamList = {
  Home: undefined;
  HazardMap: undefined;
  StateDetail: undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();
const Drawer = createDrawerNavigator();

/* ---------------- STACK (NO HEADER) ---------------- */

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // ✅ disable stack header
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EarthquakeHazardScreen" component={EarthquakeHazardScreen} />
      <Stack.Screen name="StateDetail" component={StateDetailScreen} />
      <Stack.Screen name="PdfViewerScreen" component={PdfViewerScreen}/>
      <Stack.Screen name="ContentScreen" component={ContentScreen}/>
    </Stack.Navigator>
  );
}

/* ---------------- CUSTOM DRAWER ---------------- */

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawer}
    >
      <View style={styles.drawerHeader}>
        <Ionicons
          name="shield-checkmark"
          size={36}
          color="#4f6f3a"
        />
        <Text style={styles.drawerTitle}>
          Vulnerability Atlas
        </Text>
      </View>

      <DrawerItem
        label="Home"
        icon={({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        )}
        onPress={() => {
          props.navigation.navigate("Home");
          props.navigation.closeDrawer();
        }}
      />

      <DrawerItem
        label="About"
        icon={({ color, size }) => (
          <Ionicons
            name="information-circle-outline"
            size={size}
            color={color}
          />
        )}
        onPress={() => {
          props.navigation.navigate("About");
          props.navigation.closeDrawer();
        }}
      />

      <DrawerItem
        label="Feedback"
        icon={({ color, size }) => (
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={size}
            color={color}
          />
        )}
        onPress={() => {
          props.navigation.navigate("Feedback");
          props.navigation.closeDrawer();
        }}
      />
    </DrawerContentScrollView>
  );
}

/* ---------------- ROOT ---------------- */

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerPosition="right"
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: "#4f6f3a",
          drawerLabelStyle: { fontSize: 16 },
        }}
        drawerContent={(props) => (
          <CustomDrawerContent {...props} />
        )}
      >
        <Drawer.Screen name="Home" component={MainStack} />
        <Drawer.Screen name="About" component={AboutScreen} />
        <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

/* ---------------- SIMPLE SCREENS ---------------- */

function AboutScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.pageTitle}>About Us</Text>
    </View>
  );
}

function FeedbackScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.pageTitle}>Feedback</Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    paddingTop: 0,
  },

  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  drawerTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#4f6f3a",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
});
