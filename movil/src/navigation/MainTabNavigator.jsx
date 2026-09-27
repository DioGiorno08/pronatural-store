import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// importamos las pantallas de las secciones principales del menú administrativo
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminProductsScreen from "../screens/AdminProductsScreen";
import AdminSalesScreen from "../screens/AdminSalesScreen";
import AdminReportsScreen from "../screens/AdminReportsScreen";
import AdminCustomersScreen from "../screens/AdminCustomersScreen";
import ProfileScreen from "../screens/ProfileScreen";

// arreglos con la configuración de las pestañas del menú inferior
const TABS = [
  { name: "Dashboard", label: "Resumen",    icon: "stats-chart",   component: AdminDashboardScreen },
  { name: "Products",  label: "Productos",  icon: "cube",          component: AdminProductsScreen },
  { name: "Sales",     label: "Ventas",     icon: "receipt",       component: AdminSalesScreen },
  { name: "Reports",   label: "Reportes",   icon: "document-text", component: AdminReportsScreen },
  { name: "Customers", label: "Clientes",   icon: "people",        component: AdminCustomersScreen },
  { name: "Profile",   label: "Perfil",     icon: "person-circle", component: ProfileScreen },
];

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: "#FAF9F6",
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#102B1E",
        headerTitleStyle: { fontWeight: "700", fontSize: 17 },

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "rgba(16, 43, 30, 0.1)",
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#0B2B1E",
        tabBarInactiveTintColor: "#66736B",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },

        tabBarIcon: ({ focused, color, size }) => {
          const tab = TABS.find(t => t.name === route.name);
          const iconName = tab
            ? (focused ? tab.icon : `${tab.icon}-outline`)
            : "ellipse";
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      {TABS.map(({ name, label, component }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{ tabBarLabel: label, title: label }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
