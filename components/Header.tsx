import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showLogo = true,
  rightComponent,
}) => {
  const navigation: any = useNavigation();

  return (
   <View style={styles.header}>

     {/* LOGOS */}
     {showLogo && (
       <View style={styles.logoRow}>

         <Image
           source={require("../assets/images/vai-logo.png")}
           style={styles.vaiLogo}
           resizeMode="contain"
         />

         <Image
           source={require("../assets/images/mohua-logo.png")}
           style={styles.mohuaLogo}
           resizeMode="contain"
         />

         <Image
           source={require("../assets/images/bmtpc-logo.png")}
           style={styles.bmtpcLogo}
           resizeMode="contain"
         />

       </View>
     )}

     {/* BACK */}
     {showBack && (
       <Pressable
         style={styles.backButton}
         onPress={() => navigation.goBack()}
       >
         <Ionicons
           name="arrow-back"
           size={25}
           color="#fff"
         />
       </Pressable>
     )}

     {/* MENU */}
     <Pressable
       style={styles.menuButton}
       onPress={() => navigation.toggleDrawer()}
     >
       <Ionicons
         name="menu"
         size={24}
         color="#fff"
       />
     </Pressable>

   </View>
  );
};

export default Header;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  header: {
    height: 220,
    backgroundColor: "#FDC08A",

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

    elevation: 6,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,

    position: "relative",
  },

  // Three logos
  logoRow: {
    position: "absolute",

    top: 60,
    left: 15,
    right: 15,

    height: 60,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  vaiLogo: {
    width: 70,
    height: 55,
  },

  mohuaLogo: {
    width: 125,
    height: 55,
  },

  bmtpcLogo: {
    width: 70,
    height: 55,
  },

  // Back arrow
  backButton: {
    position: "absolute",

    left: 14,
    top: 120,

    width: 35,
    height: 35,

    alignItems: "center",
    justifyContent: "center",

    zIndex: 20,
  },

  // Hamburger BELOW BMTPC
  menuButton: {
    position: "absolute",

    right: 14,
    top: 120,


    width: 35,
    height: 35,

    alignItems: "center",
    justifyContent: "center",

    zIndex: 20,
  },

  rightComponent: {
    position: "absolute",
    right: 20,
    top: 140,
  },
});