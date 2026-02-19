import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

type Screen = "hazards" | "about" | "feedback";

interface Props {
  activeScreen: Screen;
  onChange: (screen: Screen) => void;
}

const BottomNav: React.FC<Props> = ({
  activeScreen,
  onChange,
}) => {
  return (
    <View style={styles.nav}>
      <Pressable onPress={() => onChange("hazards")}>
        <Text
          style={
            activeScreen === "hazards"
              ? styles.active
              : styles.inactive
          }
        >
          ⚠ Hazards
        </Text>
      </Pressable>

      <Pressable onPress={() => onChange("about")}>
        <Text
          style={
            activeScreen === "about"
              ? styles.active
              : styles.inactive
          }
        >
          ℹ About Us
        </Text>
      </Pressable>

      <Pressable onPress={() => onChange("feedback")}>
        <Text
          style={
            activeScreen === "feedback"
              ? styles.active
              : styles.inactive
          }
        >
          💬 Feedback
        </Text>
      </Pressable>
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  active: {
    color: "#4f6f3a",
    fontWeight: "700",
  },
  inactive: {
    color: "#999",
  },
});
