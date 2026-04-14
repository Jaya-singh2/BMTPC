import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";

interface Props {
  title: string;
  icon: any;
  onPress?: () => void;   // ✅ add this
}

const HazardCard: React.FC<Props> = ({ title, icon, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.arrow}> → </Text>

      <Image source={{ uri: icon }} style={styles.icon} />

      <Image
        source={require("../assets/images/hazards/crack.png")}
        style={styles.crack}
      />
    </Pressable>
  );
};

export default HazardCard;


const styles = StyleSheet.create({

  card: {
    width: "48%",
    backgroundColor: "#cfe3be",
    borderRadius: 16,
    padding: 12,
    height: 120,
    marginBottom: 12,
    position: "relative",

    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
  },

  arrow: {
    position: "absolute",
    top: 10,
    right: 5,
    fontSize: 17,
    color: "#333",
  },

  icon: {
    width: 55,
    height: 55,
    alignSelf: "center",
    marginTop: 20,
    resizeMode: "contain",
  },

  crack: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});
