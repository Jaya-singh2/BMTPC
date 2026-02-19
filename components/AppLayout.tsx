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
}

const AppLayout: React.FC<Props> = ({
  title,
  children,
  activeTab,
  onTabChange,
  showBack = true,
  showLogo = false,
  subtitle,
  scrollable = true,
}) => {
  return (
    <View style={styles.root}>
    <Header
        title={title}
        showBack={showBack}
        showLogo={showLogo}
        subtitle={subtitle}
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
    backgroundColor: "#edf7e6",
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
