import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  showLogo = false,
  subtitle
}) => {
  const navigation: any = useNavigation();

  return (
    <View style={styles.header}>
      {showBack && (
        <Pressable
          style={styles.leftIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
      )}

      <Pressable
        style={styles.rightIcon}
        onPress={() => navigation.toggleDrawer()}
      >
        <Ionicons name="menu" size={24} color="#fff" />
      </Pressable>

      <View style={styles.centerContent}>
        {/* {showLogo && (
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        )} */}

        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

export default Header;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  header: {
    height: 230,
    paddingTop: 40,
    backgroundColor: "#6f8f55",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  centerContent: {
    alignItems: "center",
    marginTop: -50,
  },

  logo: {
    width: 60,
    height: 60,
    marginBottom: 6,
  },


  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

 subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase"
  },

  leftIcon: {
    position: "absolute",
    left: 16,
    top: 48,
  },

  rightIcon: {
    position: "absolute",
    right: 16,
    top: 48,
  },
});
