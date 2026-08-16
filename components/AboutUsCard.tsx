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
     <Pressable style={styles.card} onPress={onPress}>
       <Text style={styles.title}>{title}</Text>

       <View style={styles.iconContainer}>
       {/*<Text style={styles.arrow}> → </Text>*/}
           <Image source={{uri : icon}} style={styles.icon} />
       </View>

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
    right: 5,
    fontSize: 17,
    color: "#333",
  },

icon: {
  width: 70,
  height: 70,
  resizeMode: "contain",
},

iconContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
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
