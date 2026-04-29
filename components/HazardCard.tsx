import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";

interface Props {
    key: string;
  title: string;
  icon: any;
  onPress?: () => void;
}

const HazardCard: React.FC<Props> = ({
  title,
  icon,
  onPress,
}) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.arrow}>→</Text>

      {title==="Vulnerability Risk Table"?
           <Image
              source={require("../assets/images/hazards/risk.png")}
              style={styles.icon}
           />:
          <Image source={icon} style={styles.icon} />
          }
      <Image
        source={require("../assets/images/hazards/crack.png")}
        style={styles.crack}
      />
    </Pressable>
  );
};

export default HazardCard;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
card: {
  width: "48%",
  backgroundColor: "#FDC08A",
  borderRadius: 16,
  padding: 12,
  minHeight: 150,
  marginBottom: 12,
  position: "relative",
  justifyContent: "space-between",
  overflow: "hidden",
  elevation: 4,
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 6,
},


  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },

  arrow: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 16,
    color: "#333",
  },
icon: {
  width: 55,
  height: 55,
  resizeMode: "contain",
  alignSelf: "center",
  marginTop: "auto",
  marginBottom: 10,
},

  crack: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});
