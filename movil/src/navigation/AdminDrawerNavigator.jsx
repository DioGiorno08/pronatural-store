import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Modal,
  BackHandler,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

const MENU_ITEMS = [
  { id: "Dashboard",  label: "Panel Principal",        icon: "stats-chart-outline",  activeIcon: "stats-chart" },
  { id: "Products",   label: "Catálogo e Inventario", icon: "cube-outline",         activeIcon: "cube" },
  { id: "Categories", label: "Categorías",             icon: "pricetags-outline",    activeIcon: "pricetags" },
  { id: "Sales",      label: "Ventas y Pedidos",       icon: "receipt-outline",      activeIcon: "receipt" },
  { id: "Customers",  label: "Clientes",               icon: "people-outline",       activeIcon: "people" },
  { id: "Sellers",    label: "Vendedores",             icon: "briefcase-outline",    activeIcon: "briefcase" },
  { id: "Reports",    label: "Reportes",               icon: "document-text-outline",activeIcon: "document-text" },
  { id: "Settings",   label: "Ajustes",                icon: "settings-outline",     activeIcon: "settings" },
  { id: "Profile",    label: "Mi Perfil",              icon: "person-circle-outline",activeIcon: "person-circle" },
];

const AdminDrawerNavigator = ({ navigation: rootNav }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const DRAWER_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.82), 330);

  const [activeScreen, setActiveScreen] = useState("Dashboard");
  const [screenHistory, setScreenHistory] = useState(["Dashboard"]);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const slideAnim   = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Manejador del botón físico "Atrás" en Android
  useEffect(() => {
    const onBackPress = () => {
      if (drawerVisible) {
        closeDrawer();
        return true;
      }
      if (screenHistory.length > 1) {
        goBack();
        return true;
      }
      if (activeScreen !== "Dashboard") {
        navigateTo("Dashboard");
        return true;
      }
      return false; // Permite salir de la app si ya está en Dashboard
    };

    const backSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => backSubscription.remove();
  }, [drawerVisible, screenHistory, activeScreen]);

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = (callback) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerVisible(false);
      if (callback) callback();
    });
  };

  const navigateTo = (screenId) => {
    if (screenId === activeScreen) return;
    setScreenHistory((prev) => [...prev, screenId]);
    setActiveScreen(screenId);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop(); // Remove current
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setActiveScreen(prevScreen);
    } else if (activeScreen !== "Dashboard") {
      setActiveScreen("Dashboard");
      setScreenHistory(["Dashboard"]);
    }
  };

  const handleSelectScreen = (screenId) => {
    closeDrawer(() => {
      navigateTo(screenId);
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

  // Objeto de navegación personalizado accesible para todas las pantallas hijas
  const customNavigation = {
    ...rootNav,
    navigate: (screenName) => {
      const match = MENU_ITEMS.find(
        (m) => m.id.toLowerCase() === screenName.toLowerCase()
      );
      if (match) {
        navigateTo(match.id);
      } else if (rootNav?.navigate) {
        rootNav.navigate(screenName);
      }
    },
    goBack,
    canGoBack: () => screenHistory.length > 1 || activeScreen !== "Dashboard",
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
  const isSubScreen = activeScreen !== "Dashboard";

  // Altura adaptativa de notch/barra de estado para cualquier celular
  const topInsetHeight = Math.max(
    insets.top,
    Platform.OS === "android" ? StatusBar.currentHeight || 24 : 38
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0d0f" translucent={true} />

      {/* HEADER SUPERIOR CON BOTÓN REGRESAR (←) Y MENÚ DE HAMBURGUESA (☰) */}
      <View
        style={[
          styles.topHeader,
          {
            paddingTop: topInsetHeight + 4,
            height: topInsetHeight + 58,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {/* BOTÓN REGRESAR (Se muestra en todas las pantallas secundarias) */}
          {isSubScreen && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={goBack}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          {/* BOTÓN HAMBURGUESA (Siempre visible para abrir el drawer) */}
          <TouchableOpacity
            style={[styles.hamburgerBtn, isSubScreen && styles.hamburgerBtnCompact]}
            onPress={openDrawer}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="menu" size={24} color="#30b466" />
          </TouchableOpacity>
        </View>

        {/* TÍTULO DE LA PANTALLA ACTIVA */}
        <View style={styles.titleWrap}>
          <View style={styles.indicatorDot} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentItem.label}
          </Text>
        </View>

        {/* PERFIL / INICIALES EN LA DERECHA */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => handleSelectScreen("Profile")}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.profileBadgeTxt}>{userInitials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENIDO DE LA PANTALLA ACTIVA CON SAFE AREA INFERIOR */}
      <View
        style={[
          styles.screenContent,
          { paddingBottom: Math.max(insets.bottom, 6) },
        ]}
      >
        {renderActiveScreen()}
      </View>

      {/* MODAL NATIVO DEL DRAWER: COMPATIBILIDAD TOTAL ANDROID / IOS */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalRoot}>
          {/* BACKDROP OSCURO CON OPACIDAD ANIMADA */}
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
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
              {
                width: DRAWER_WIDTH,
                paddingTop: topInsetHeight + 12,
                paddingBottom: Math.max(insets.bottom, 16) + 12,
                transform: [{ translateX: slideAnim }],
              },
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
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color="#aaa" />
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
              bounces={false}
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
                    activeOpacity={0.75}
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
                        color={isActive ? "#30b466" : "#888"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuItemText,
                        isActive && styles.menuItemTextActive,
                      ]}
                      numberOfLines={1}
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
                ProNatural Store · Administración
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminDrawerNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0d0f",
  },

  // Barra superior principal adaptativa
  topHeader: {
    backgroundColor: "#0d1114",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#161b1f",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#161b1f",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(48, 180, 102, 0.25)",
  },
  hamburgerBtnCompact: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
  titleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 8,
  },
  indicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#30b466",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  headerRight: {
    minWidth: 40,
    alignItems: "flex-end",
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

  screenContent: {
    flex: 1,
    backgroundColor: "#0a0d0f",
  },

  // Raíz del modal que ocupa 100% de la pantalla nativa
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  drawerPanel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#0d1114",
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 25,
  },

  // Cabecera del Drawer
  drawerHeader: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  logoImage: {
    width: 140,
    height: 38,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121619",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  drawerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(48, 180, 102, 0.15)",
    borderWidth: 1.5,
    borderColor: "#30b466",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerAvatarTxt: {
    color: "#30b466",
    fontSize: 15,
    fontWeight: "bold",
  },
  drawerUserName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  drawerUserEmail: {
    color: "#777",
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

  // Lista de items del menú
  menuScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuSectionTitle: {
    color: "#555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginLeft: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: "rgba(48, 180, 102, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(48, 180, 102, 0.25)",
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  menuIconWrapActive: {
    backgroundColor: "rgba(48, 180, 102, 0.2)",
  },
  menuItemText: {
    color: "#888",
    fontSize: 13.5,
    fontWeight: "500",
    flex: 1,
  },
  menuItemTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeIndicatorBar: {
    width: 3.5,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#30b466",
  },

  // Pie del drawer
  drawerFooter: {
    paddingHorizontal: 14,
    paddingTop: 12,
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
    paddingVertical: 11,
    borderRadius: 10,
    marginBottom: 8,
  },
  logoutBtnTxt: {
    color: "#ef4444",
    fontSize: 13.5,
    fontWeight: "bold",
  },
  versionTxt: {
    color: "#444",
    textAlign: "center",
    fontSize: 10.5,
  },
});
