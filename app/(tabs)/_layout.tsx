import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => { //setting the icon logo
          let iconName; //ionicons name
          if (route.name === "discover") iconName = "home";
          else if (route.name === "notifications") iconName = "notifications";
          else if (route.name === "messages") iconName = "chatbubble";
          else if (route.name === "profile") iconName = "person";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        //tab bar other details
        tabBarActiveTintColor: "#FF6B6B", //for chosen tab
        tabBarInactiveTintColor: "gray", //for non-chosen tab
        headerShown: true,
        headerTitleStyle: {
          fontSize: 22,
          fontWeight:"600",
          paddingTop:6,
        },

        headerRightContainerStyle: {
          paddingRight: 16,
          paddingBottom: 4,
        },

        headerLeftContainerStyle: {
          paddingLeft: 10,
          paddingBottom: 4,
        },
      })}
    >
      <Tabs.Screen name="discover" options={{ title: "Home" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
