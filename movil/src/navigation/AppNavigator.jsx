import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// importamos las pantallas para el flujo de autenticación y navegación
import SplashScreenCustom from "../screens/SplashScreenCustom";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

// importamos el navegador de pestañas del panel administrativo
import MainTabNavigator from "./MainTabNavigator";

// importamos el hook useAuth para controlar el acceso y sesión del usuario
import useAuth from "../hooks/useAuth";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  // utilizamos el hook useAuth para controlar el estado del usuario y la carga de sesión
  const { user, loading } = useAuth();
  // estado para controlar la reproducción de la pantalla splash de 1 segundo al inicio
  const [splashFinished, setSplashFinished] = useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0d0f", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#30b466" />
      </View>
    );
  }

  // Si el splash de inicio no ha finalizado, lo mostramos por 1 segundo
  if (!splashFinished) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ animation: "fade" }}>
          <Stack.Screen name="Splash" options={{ headerShown: false }}>
            {(props) => (
              <SplashScreenCustom
                {...props}
                onFinish={() => setSplashFinished(true)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Una vez cumplido el segundo del splash, alternamos la navegación según si el usuario inició sesión
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animation: "fade" }}>
        {user ? (
          // Usuario autenticado: acceso exclusivo al panel administrativo (AdminMain)
          <Stack.Screen name="AdminMain" component={MainTabNavigator} options={{ headerShown: false }} />
        ) : (
          // Usuario cerrado de sesión o no autenticado: redirige inmediatamente a Login y bloquea acceso a las funciones
          <>
            <Stack.Screen name="Login"          component={LoginScreen}           options={{ headerShown: false }} />
            <Stack.Screen name="Welcome"        component={WelcomeScreen}        options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
