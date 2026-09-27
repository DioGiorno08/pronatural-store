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
import AnimatedEntrance from "../components/AnimatedEntrance";
import AppIcon3D from "../components/AppIcon3D";

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

const logoProNatural = require("../../assets/logopronatural-negro.png");

const MENU_ITEMS = [
  { id: "Dashboard",  label: "Panel Principal",        icon: "grid-outline",         activeIcon: "grid" },
  { id: "Products",   label: "Catálogo e Inventario", icon: "cube-outline",         activeIcon: "cube" },
  { id: "Categories", label: "Categorías",             icon: "pricetags-outline",    activeIcon: "pricetags" },
  { id: "Sales",      label: "Ventas y Pedidos",       icon: "cart-outline",         activeIcon: "cart" },
  { id: "Customers",  label: "Clientes",               icon: "people-outline",       activeIcon: "people" },
  { id: "Sellers",    label: "Vendedores",             icon: "briefcase-outline",    activeIcon: "briefcase" },
  { id: "Reports",    label: "Reportes",               icon: "bar-chart-outline",    activeIcon: "bar-chart" },
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
  const QUICK_NAV_ITEMS = [
    { id: "Dashboard", label: "Inicio", icon: "grid-outline", activeIcon: "grid" },
    { id: "Products", label: "Inventario", icon: "cube-outline", activeIcon: "cube" },
    { id: "Sales", label: "Ventas", icon: "cart-outline", activeIcon: "cart" },
    { id: "More", label: "Más", icon: "apps-outline", activeIcon: "apps" },
  ];

  // Altura adaptativa de notch/barra de estado para cualquier celular
  const topInsetHeight = Math.max(
    insets.top,
    Platform.OS === "android" ? StatusBar.currentHeight || 24 : 38
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" translucent={true} />

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
              <Ionicons name="arrow-back" size={22} color="#102B1E" />
            </TouchableOpacity>
          )}
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
        ]}
      >
        <AnimatedEntrance key={activeScreen} style={{ flex: 1 }} distance={8} duration={220}>
          {renderActiveScreen()}
        </AnimatedEntrance>
      </View>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {QUICK_NAV_ITEMS.map((item) => {
          const selected = item.id === "More"
            ? !["Dashboard", "Products", "Sales"].includes(activeScreen)
            : activeScreen === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.bottomNavItem, selected && styles.bottomNavItemActive]}
              onPress={() => item.id === "More" ? openDrawer() : navigateTo(item.id)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={item.id === "More" ? "Abrir todos los módulos" : `Ir a ${item.label}`}
            >
              <AppIcon3D
                name={selected ? item.activeIcon : item.icon}
                size={31}
                iconSize={17}
                color={selected ? "#0B2B1E" : "#66736B"}
                surface={selected ? "#E5EFE7" : "#FFFFFF"}
                depth={selected ? "#B7CFBC" : "#E3E0D8"}
                radius={11}
              />
              <Text style={[styles.bottomNavLabel, selected && styles.bottomNavLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
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
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12 }}>
                <Image
                  source={logoProNatural}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => closeDrawer()}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color="#66736B" />
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
                    <Ionicons name="shield-checkmark" size={10} color="#0B2B1E" />
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
                      <AppIcon3D
                        name={isActive ? item.activeIcon : item.icon}
                        size={25}
                        iconSize={15}
                        color={isActive ? "#0B2B1E" : "#66736B"}
                        surface={isActive ? "#E5EFE7" : "#FFFFFF"}
                        depth={isActive ? "#B7CFBC" : "#E3E0D8"}
                        radius={9}
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
    backgroundColor: "#FAF9F6",
  },

  // Barra superior principal adaptativa
  topHeader: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16, 43, 30, 0.08)",
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
    backgroundColor: "#F5F3ED",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.12)",
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
    backgroundColor: "#E24B00",
  },
  headerTitle: {
    color: "#102B1E",
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
    backgroundColor: "rgba(11, 43, 30, 0.15)",
    borderWidth: 1,
    borderColor: "#0B2B1E",
    justifyContent: "center",
    alignItems: "center",
  },
  profileBadgeTxt: {
    color: "#0B2B1E",
    fontWeight: "bold",
    fontSize: 13,
  },

  screenContent: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F3F1EB",
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 43, 30, 0.07)",
  },
  bottomNavItem: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  bottomNavItemActive: {
    backgroundColor: "rgba(226, 75, 0, 0.08)",
  },
  bottomNavLabel: {
    color: "#68736A",
    fontSize: 11,
    fontWeight: "500",
  },
  bottomNavLabelActive: {
    color: "#B83C00",
    fontWeight: "700",
  },

  // Raíz del modal que ocupa 100% de la pantalla nativa
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 43, 30, 0.34)",
  },
  drawerPanel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "rgba(16, 43, 30, 0.1)",
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
    borderBottomColor: "rgba(16, 43, 30, 0.06)",
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
    backgroundColor: "rgba(16, 43, 30, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.08)",
  },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F1EB",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.08)",
  },
  drawerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(11, 43, 30, 0.15)",
    borderWidth: 1.5,
    borderColor: "#0B2B1E",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerAvatarTxt: {
    color: "#0B2B1E",
    fontSize: 15,
    fontWeight: "bold",
  },
  drawerUserName: {
    color: "#102B1E",
    fontSize: 13,
    fontWeight: "bold",
  },
  drawerUserEmail: {
    color: "#66736B",
    fontSize: 11,
    marginTop: 1,
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(11, 43, 30, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  roleTagTxt: {
    color: "#208B51",
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
    color: "#66736B",
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
    backgroundColor: "rgba(11, 43, 30, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(11, 43, 30, 0.25)",
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(16, 43, 30, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  menuIconWrapActive: {
    backgroundColor: "rgba(11, 43, 30, 0.2)",
  },
  menuItemText: {
    color: "#66736B",
    fontSize: 13.5,
    fontWeight: "500",
    flex: 1,
  },
  menuItemTextActive: {
    color: "#102B1E",
    fontWeight: "bold",
  },
  activeIndicatorBar: {
    width: 3.5,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#0B2B1E",
  },

  // Pie del drawer
  drawerFooter: {
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 43, 30, 0.06)",
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
    color: "#66736B",
    textAlign: "center",
    fontSize: 10.5,
  },
});
