import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../hooks/useAuth";

// Importamos todas las 9 pantallas administrativas
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminProductsScreen from "../screens/AdminProductsScreen";
import AdminCategoriesScreen from "../screens/AdminCategoriesScreen";
import AdminSalesScreen from "../screens/AdminSalesScreen";
import AdminCustomersScreen from "../screens/AdminCustomersScreen";
import AdminSellersScreen from "../screens/AdminSellersScreen";
import AdminReportsScreen from "../screens/AdminReportsScreen";
import AdminSettingsScreen from "../screens/AdminSettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const logoProNatural = require("../../assets/logopronatural.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330);

const MENU_ITEMS = [
  { id: "Dashboard",  label: "Resumen General",        icon: "stats-chart-outline",  activeIcon: "stats-chart" },
  { id: "Products",   label: "Productos e Inventario", icon: "cube-outline",         activeIcon: "cube" },
  { id: "Categories", label: "Categorías",             icon: "pricetags-outline",    activeIcon: "pricetags" },
  { id: "Sales",      label: "Ventas y Pedidos",       icon: "receipt-outline",      activeIcon: "receipt" },
  { id: "Customers",  label: "Directorio Clientes",    icon: "people-outline",       activeIcon: "people" },
  { id: "Sellers",    label: "Equipo y Vendedores",    icon: "briefcase-outline",    activeIcon: "briefcase" },
  { id: "Reports",    label: "Reportes Ejecutivos PDF",icon: "document-text-outline",activeIcon: "document-text" },
  { id: "Settings",   label: "Ajustes del Sistema",    icon: "settings-outline",     activeIcon: "settings" },
  { id: "Profile",    label: "Mi Perfil",              icon: "person-circle-outline",activeIcon: "person-circle" },
];

const AdminDrawerNavigator = ({ navigation: rootNav }) => {
  const { user, logout } = useAuth();
  const [activeScreen, setActiveScreen] = useState("Dashboard");
  const [drawerOpen, setDrawerOpen]     = useState(false);

  const slideAnim   = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = (callback) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerOpen(false);
      if (callback) callback();
    });
  };

  const handleSelectScreen = (screenId) => {
    closeDrawer(() => {
      setActiveScreen(screenId);
    });
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir del portal administrativo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            closeDrawer();
            await logout();
          },
        },
      ]
    );
  };

  // Objeto de navegación personalizado para que las pantallas internas puedan cambiar de vista
  const customNavigation = {
    ...rootNav,
    navigate: (screenName) => {
      const match = MENU_ITEMS.find(
        (m) => m.id.toLowerCase() === screenName.toLowerCase()
      );
      if (match) {
        setActiveScreen(match.id);
      } else if (rootNav?.navigate) {
        rootNav.navigate(screenName);
      }
    },
    openDrawer,
    closeDrawer,
  };

  // Renderizar la pantalla activa
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case "Dashboard":
        return <AdminDashboardScreen navigation={customNavigation} />;
      case "Products":
        return <AdminProductsScreen navigation={customNavigation} />;
      case "Categories":
        return <AdminCategoriesScreen navigation={customNavigation} />;
      case "Sales":
        return <AdminSalesScreen navigation={customNavigation} />;
      case "Customers":
        return <AdminCustomersScreen navigation={customNavigation} />;
      case "Sellers":
        return <AdminSellersScreen navigation={customNavigation} />;
      case "Reports":
        return <AdminReportsScreen navigation={customNavigation} />;
      case "Settings":
        return <AdminSettingsScreen navigation={customNavigation} />;
      case "Profile":
        return <ProfileScreen navigation={customNavigation} />;
      default:
        return <AdminDashboardScreen navigation={customNavigation} />;
    }
  };

  const currentItem = MENU_ITEMS.find((m) => m.id === activeScreen) || MENU_ITEMS[0];
  const userName = user?.name || "Administrador";
  const userInitials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const userRole = user?.role === "Employee" ? "Vendedor" : "Administrador";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1114" />

      {/* HEADER SUPERIOR CON MENÚ DE HAMBURGUESA (☰) */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={openDrawer}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="menu-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <View style={styles.indicatorDot} />
          <Text style={styles.headerTitle}>{currentItem.label}</Text>
        </View>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={() => setActiveScreen("Profile")}
          activeOpacity={0.8}
        >
          <Text style={styles.profileBadgeTxt}>{userInitials}</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO DE LA PANTALLA ACTIVA */}
      <View style={styles.screenContent}>
        {renderActiveScreen()}
      </View>

      {/* MENÚ DE HAMBURGUESA LATERAL (DRAWER) CON FONDO OSCURECIDO */}
      {drawerOpen && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          {/* BACKDROP CON OPACIDAD ANIMADA */}
          <Animated.View
            style={[styles.backdrop, { opacity: opacityAnim }]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => closeDrawer()}
              activeOpacity={1}
            />
          </Animated.View>

          {/* PANEL LATERAL DESLIZABLE */}
          <Animated.View
            style={[
              styles.drawerPanel,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* ENCABEZADO DEL DRAWER */}
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <Image
                  source={logoProNatural}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => closeDrawer()}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={styles.userInfoCard}>
                <View style={styles.drawerAvatar}>
                  <Text style={styles.drawerAvatarTxt}>{userInitials}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.drawerUserName} numberOfLines={1}>
                    {userName}
                  </Text>
                  <Text style={styles.drawerUserEmail} numberOfLines={1}>
                    {user?.email || "admin@pronatural.com"}
                  </Text>
                  <View style={styles.roleTag}>
                    <Ionicons name="shield-checkmark" size={10} color="#30b466" />
                    <Text style={styles.roleTagTxt}>{userRole.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* LISTA DE MÓDULOS DE ADMINISTRADOR */}
            <ScrollView
              style={styles.menuScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            >
              <Text style={styles.menuSectionTitle}>PORTAL ADMINISTRATIVO</Text>

              {MENU_ITEMS.map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      isActive && styles.menuItemActive,
                    ]}
                    onPress={() => handleSelectScreen(item.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.menuIconWrap,
                        isActive && styles.menuIconWrapActive,
                      ]}
                    >
                      <Ionicons
                        name={isActive ? item.activeIcon : item.icon}
                        size={20}
                        color={isActive ? "#30b466" : "#777"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuItemText,
                        isActive && styles.menuItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isActive && (
                      <View style={styles.activeIndicatorBar} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* PIE DEL DRAWER CON BOTÓN DE CERRAR SESIÓN */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={styles.logoutBtnTxt}>Cerrar Sesión</Text>
              </TouchableOpacity>
              <Text style={styles.versionTxt}>
                ProNatural Admin · v1.0.0
              </Text>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export default AdminDrawerNavigator;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0d0f" },

  // Barra superior principal
  topHeader: {
    height: 60,
    backgroundColor: "#0d1114",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  hamburgerBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#161b1f",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#30b466",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(48, 180, 102, 0.15)",
    borderWidth: 1,
    borderColor: "#30b466",
    justifyContent: "center",
    alignItems: "center",
  },
  profileBadgeTxt: {
    color: "#30b466",
    fontWeight: "bold",
    fontSize: 13,
  },

  screenContent: { flex: 1 },

  // Drawer modal
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  drawerPanel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#0d1114",
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 36,
    display: "flex",
    flexDirection: "column",
  },

  // Cabecera del Drawer
  drawerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logoImage: {
    width: 140,
    height: 40,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121619",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(48, 180, 102, 0.15)",
    borderWidth: 1.5,
    borderColor: "#30b466",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerAvatarTxt: {
    color: "#30b466",
    fontSize: 16,
    fontWeight: "bold",
  },
  drawerUserName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  drawerUserEmail: {
    color: "#666",
    fontSize: 11,
    marginTop: 1,
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(48, 180, 102, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  roleTagTxt: {
    color: "#4ade80",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // Lista de items
  menuScroll: { flex: 1, paddingHorizontal: 12 },
  menuSectionTitle: {
    color: "#555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginLeft: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: "rgba(48, 180, 102, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(48, 180, 102, 0.25)",
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuIconWrapActive: {
    backgroundColor: "rgba(48, 180, 102, 0.2)",
  },
  menuItemText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  menuItemTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeIndicatorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#30b466",
  },

  // Pie del drawer
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutBtnTxt: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "bold",
  },
  versionTxt: {
    color: "#444",
    textAlign: "center",
    fontSize: 11,
  },
});
