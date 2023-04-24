import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';

import HomeNavigation from "./navigation/index";

import RegistrationScreen from "./screens/RegistrationScreen";
import { NavigationContainer, TabActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OpeningScreen from "./screens/OpeningScreen";
import Login from "./screens/LoginScreen";
import WelcomeScreen from "./screens/WelcomeScreen";

import Verification from "./screens/Verification";
import EmailVerificationScreen from "./screens/EmailVerificationScreen";
import TermsAndConditions from "./screens/TermsAndConditionsScreen";
import Loading from "./screens/Loading";
import React, { useState, useEffect } from "react";
import { AuthContext, UserInfo, WelcomeContext } from "./navigation/context";

import { backendUrl } from "./config/config.json";

import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { retrieveDataString, storeDataString } from "./components/Helpers";
import { Alert } from "react-native";

const AuthStack = createNativeStackNavigator();
const WelcomeStack = createNativeStackNavigator();

const WelcomeStackNavigator = () => {
  return (
    <WelcomeStack.Navigator>
      <WelcomeStack.Screen
        name="WelcomeScreen"
        component={WelcomeScreen}
        options={{ headerShown: false, title: "Welcome" }}
      />
    </WelcomeStack.Navigator>
  );
};

const AuthenticationStackNavigator = () => {
  return (
    <AuthStack.Navigator>
      {/* <AuthStack.Screen
        name="WelcomeScreen"
        component={WelcomeScreen}
        options={{ headerShown: false, title: "Welcome" }}
      /> */}

      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false, title: "Log in" }}
      />
      <AuthStack.Screen
        name="Registration"
        component={RegistrationScreen}
        options={{ title: "Sign Up" }}
      />

      <AuthStack.Screen
        name="TermsAndConditions"
        component={TermsAndConditions}
        options={{ title: "Terms and Conditions" }}
      />

      <AuthStack.Screen name="Opening" component={OpeningScreen} />
      <AuthStack.Screen
        name="VerificationScreen"
        component={Verification}
        options={{ headerShown: true, title: "Verification" }}
      />
      <AuthStack.Screen
        name="EmailVerificationScreen"
        component={EmailVerificationScreen}
        options={{ headerShown: true, title: "Verification" }}
      />
    </AuthStack.Navigator>
  );
};

export default function App() {
  const colorScheme = useColorScheme();

  const [isLoading, setIsLoading] = React.useState(true);
  const [authValid, setAuthValid] = React.useState(false);
  const [isFirstTime, setIsFirstTime] = React.useState(true);

  const [userInfo, setUserInfo] = React.useState<any>();

  const setItem = (name: string, data: string) => {
    try {
      SecureStore.setItemAsync(name, data);

    } catch (error: any) {
      // Error saving data
      console.log("AsyncStorage save error: " + error.message);
    }
  };

  const verifyToken = async () => {
    await SecureStore.getItemAsync("user_token").then((token) => {
      
      axios
        .get(`${backendUrl}/api/auth/jwt-test`, {
          headers: {
            Authorization: token,
          },
        })
        .then((response) => {
          let info = {
            email: response.data["email"],
            firstName: response.data["firstName"],
            lastName: response.data["lastName"],
          };
          setUserInfo(info);
          storeDataString("last_info", JSON.stringify(info));
          setAuthValid(true);
          console.log(userInfo);
        })
        .catch((error) => {
          console.log("Your are not logged in!"); // token error
          if (authValid) {
            Alert.alert("Login is expired. Please log in again.");
          }
          setAuthValid(false);
        });
    });

  };

  const authContext = React.useMemo(() => {
    return {
      signIn: (token: string) => {
        setItem("user_token", token);
        verifyToken();
      },

      signOut: () => {
        setAuthValid(false);
        setItem("user_token", "");
      },
    };
  }, []);

  useEffect(() => {
    (async () => {
      let token = await SecureStore.getItemAsync("user_token");
      if (!token) {
        setAuthValid(false);
      } else {
        let info = await retrieveDataString("last_info");
        setUserInfo(JSON.stringify(info));
        setAuthValid(true);
      }
    })();
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    retrieveDataString("is_first_time").then((first) => {
      if (!first) {
        storeDataString("is_first_time", "true");
      } else {
        setIsFirstTime(false);
      }
    });

    verifyToken();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider
      value={{ authFunctions: authContext, userInfo: userInfo }}
    >
      <NavigationContainer>
        {isFirstTime ? (
          <WelcomeContext.Provider value={{ isFirstTime, setIsFirstTime }}>
            <WelcomeStackNavigator />
          </WelcomeContext.Provider>
        ) : authValid ? (
          <HomeNavigation />
        ) : (
          <AuthenticationStackNavigator />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

