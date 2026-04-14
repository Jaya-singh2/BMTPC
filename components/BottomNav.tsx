import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Screen = "hazards" | "about" | "feedback";

interface Props {
  activeScreen: Screen;
  onChange: (screen: Screen) => void;
}

const BottomNav: React.FC<Props> = ({
  activeScreen,
  onChange,
}) => {

  const navigation = useNavigation<any>();
  return (
    <View style={styles.nav}>

      <Pressable onPress={() => onChange("hazards")}>
        <Ionicons
          name="warning-outline"
          size={30}
          color={activeScreen === "hazards" ? "#4f6f3a" : "#999"}
        />
      </Pressable>

      <Pressable onPress={() => onChange("about")}>
        <Ionicons
          name="information-circle-outline"
          size={30}
          color={activeScreen === "about" ? "#4f6f3a" : "#999"}
        />
      </Pressable>

      <Pressable
        onPress={() => {
          onChange("feedback");
          navigation.navigate("FeedbackScreen");
        }}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={30}
          color={activeScreen === "feedback" ? "#4f6f3a" : "#999"}
        />
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
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    elevation: 10,
  },
});
