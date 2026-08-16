import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import Header from "./Header";
import BottomNav from "./BottomNav";

interface Props {
  title: string;
  children: React.ReactNode;
  activeTab?: "hazards" | "about" | "feedback";
  onTabChange?: (tab: any) => void;
  showBack?: boolean;
  showLogo?: boolean;
  subtitle?: string;
  scrollable?: boolean;
  rightComponent?: React.ReactNode;
}

const AppLayout: React.FC<Props> = ({
  title,
  children,
  activeTab,
  onTabChange,
  showBack = true,
  showLogo = true,
  subtitle,
  scrollable = true,
  rightComponent

}) => {
  return (
    <View style={styles.root}>
    <Header
        title={title}
        showBack={showBack}
        showLogo={showLogo}
        subtitle={subtitle}
        rightComponent={rightComponent}
      />

      <View style={styles.body}>
        <View style={styles.greyLayer}>
              {children}
        </View>
      </View>

      {!showBack && activeTab && onTabChange && (
        <BottomNav
          activeScreen={activeTab}
          onChange={onTabChange}
        />
      )}
    </View>
  );
};

export default AppLayout;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFBDC",
  },

  body: {
    flex: 1,
  },

  greyLayer: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: -60,
    paddingTop: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
});
