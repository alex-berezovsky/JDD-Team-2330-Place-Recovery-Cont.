import React, { useState, useEffect, useContext, useRef } from "react";
import * as Device from "expo-device";

import {
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  TextInputComponent,
  TextInput,
  TouchableOpacity,
  Platform,
  AppState,
  ImageBackground,
} from "react-native";
import { Text, View } from "../components/Themed";
import {
  RootTabScreenProps,
  CountOfTakenQofDay,
  DaySchedule,
  DayStatus,
} from "../components/types";
import { useIsFocused } from "@react-navigation/native";
import axios from "axios";
import { backendUrl } from "../config/config.json";

import {
  convertTime,
  retrieveDataString,
  storeDataString,
  timeDifference,
  formatDate,
  nextDate,
  generateDaySchedule,
  inQuestionnaireOpenInterval,
} from "../components/Helpers";
import { AuthContext } from "../navigation/context";

import { ScrollView } from "react-native";
import * as Location from "expo-location";
import { goToSettings } from "../components/Helpers";

import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { getItemAsync } from "expo-secure-store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen({
  navigation,
}: RootTabScreenProps<"HomeStack">) {
  const { userInfo } = useContext(AuthContext);

  const isFocused = useIsFocused();

  const [schedules, setSchedules] = useState<Array<DaySchedule>>();

  const [wakeTime, setWakeTime] = useState<number>(8);
  const [sleepTime, setSleepTime] = useState<number>(22);

  const [isAvailable, setIsAvailable] = useState<number>(-1); // index of available block

  const [expoPushToken, setExpoPushToken] = useState<any>("");
  const [notification, setNotification] = useState<any>(false);

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [status, setStatus] = useState<DayStatus>({ q1: -1, q2: -1, q3: -1 });

  const handleAppStateChange = (state: any) => {
    setAppStateVisible(state);
  };
  // https://reactnative.dev/docs/appstate
  // https://rossbulat.medium.com/working-with-app-state-and-event-listeners-in-react-native-ffa9bba8f6b7
  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  const statusColor = (status: number) => {
    if (status == -1) {
      return ["#72B3BA", "#72B3BA"];
    } else if (status == 0) {
      return ["#A2A2A2", "#A2A2A2"];
    } else if (status == 1) {
      return ["#068D9D", "#068D9D"];
    } else if (status == 2) {
      return ["#068D9D", "#fff95b"];
    }
    return ["#A2A2A2", "#A2A2A2"];
  };

  /**
   *
   * @param hour hour from 0-24
   * @returns format like 8 AM, 12 PM, 6 PM
   */
  const convert24HourTo12 = (hour: number) => {
    if (hour < 12) {
      return hour.toString() + " AM";
    } else if (hour == 12) {
      return hour.toString() + " PM";
    } else {
      return (hour - 12).toString() + " PM";
    }
  };

  const updateStatus = () => {
    if (schedules) {
      let currentHour = new Date().getHours();
      let status = {
        //q1: checkStatus(0, currentHour),
        //q2: checkStatus(1, currentHour),
        //q3: checkStatus(2, currentHour),
        q1: 2,
        q2: 2,
        q3: 2,
      };
      setStatus(status);
    } else {
      setStatus({
        q1: -1,
        q2: -1,
        q3: -1,
      });
    }
  };

  /**
   *
   * @param idx idx of ith questionnaire of the day
   * @returns status: -1: no open yet; 0: missed; 1: completed; 2: currently open
   */
  const checkStatus = (idx: number, currentHour: number) => {
    if (schedules) {
      if (schedules[0].completed[idx]) {
        return 1;
      }
      let notificationTime = schedules[0].notificationTime[idx];
      if (currentHour < notificationTime) {
        return -1;
      }
      if (currentHour == notificationTime) {
        return 2;
      }
      if (currentHour > notificationTime) {
        return 0;
      }
    }
    return -1;
  };

  const getSleepSchedule = async () => {
    const token: string = (await getItemAsync("user_token"))!;
    try {
      let response = await axios.get(`${backendUrl}/api/data/myuser`, {
        headers: {
          authorization: token,
        },
      });
      if (response.status == 200) {
        let wake = new Date(response.data.wakeTime).getHours();
        let sleep = new Date(response.data.sleepTime).getHours();
        if (sleep - wake < 6) {
          wake = wake < 5 ? 8 : wake; // earliest windows starts at 5 am
          setWakeTime(wake);
          sleep = 22;
          setSleepTime(sleep);
        } else {
          setWakeTime(wake);
          setSleepTime(sleep);
        }
        return [wake, sleep];
      } else {
        return [wakeTime, sleepTime];
      }
    } catch (err) {
      console.log(err);
    }
  };

  const ready = () => {
    return (
      //isAvailable != -1 && schedules && !schedules[0].completed[isAvailable]
      true
    );
  };
  /**
   * Code from https://docs.expo.dev/push-notifications/overview/
   *
   * @returns getExpoPushTokenAsync, token
   */
  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        // alert("Failed to get push token for push notification!");
        goToSettings(
          "Require notification permission",
          "The app needs to notify you when the questionnaire is ready. Please enable notification in your phone settings."
        );
        return;
      }
      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }
    // 4:36 if token
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  //https://docs.expo.dev/versions/latest/sdk/notifications/#scheduling-the-notification-that-will-trigger-once
  async function scheduleNotification(seconds: number) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your next questionnaire is ready",
        body: "Please complete within the hour.",
        data: { data: "data goes here" },
      },
      trigger: {
        seconds: seconds,
      },
    });
  }
  // storeDataString("schedules", "");
  useEffect(() => {
    // 1. fetch local schedules from storage
    // 2. find current date in the schedules [1,2,3,4,5,6,7]; current date is 3; or current date is 8
    // pop previous passed date until meet current date, or array is empty, [3,4,5,6,7]; or [] if current date is 8
    // 3. add x new day scheduels starting from the last date in array (date 7), x = 7 - len(schedules) => [3,4,5,6,7,8,9]
    // if array is empty, add 7 new day schedules starting from today: [8,9,10,11,12,13,14]
    // for each newly added schedules, call scheduelNotification() for each time in the timeblocks.
    // 4. Display current storage
    // 5. store schedules back into async storage

    (async () => {
      let sleepschedule = (await getSleepSchedule())!;
      let wakeTime = sleepschedule[0];
      let sleepTime = sleepschedule[1];
      let schedules = await retrieveDataString(userInfo.email + "_schedules");
      let j = 0; // index of updatedSchedules
      let updatedSchedules = Array<DaySchedule>(7);
      let futureSchedulesCount = 0;
      let today = formatDate(new Date());
      let startDate = "";
      if (!schedules) {
        futureSchedulesCount = 7;
        startDate = today;
      } else {
        // find current date
        let schedulesArr = JSON.parse(schedules);
        let i = 0;
        for (; i < schedulesArr.length; i++) {
          // if < today; continue; count += 1
          if (
            new Date(today).getTime() > new Date(schedulesArr[i].date).getTime()
          ) {
            futureSchedulesCount += 1;
            continue;
          } else {
            break;
          }
        }
        // copy future schedules to updatedSchedueles
        for (; i < schedulesArr.length; i++, j++) {
          updatedSchedules[j] = schedulesArr[i];
        }
        // start day will be today
        if (futureSchedulesCount == 7) {
          startDate = today;
        } else {
          // will be last date + 1
          startDate = nextDate(schedulesArr[schedulesArr.length - 1].date);
        }
      }
      // fill out the new schedules
      for (; j < updatedSchedules.length; j++) {
        let newSchedule = generateDaySchedule(wakeTime, sleepTime, startDate);
        for (let i = 0; i < newSchedule.notificationTime.length; i++) {
          let notifyTime = new Date(newSchedule.date + "T00:00");
          notifyTime.setHours(newSchedule.notificationTime[i]);
          let { daysDifference, hoursDifference, minutesDifference } =
            timeDifference(notifyTime.getTime(), new Date().getTime());
          newSchedule.timeBlocks[i].identifier = await scheduleNotification(
            (minutesDifference + 1) * 60 +
              hoursDifference * 60 * 60 +
              daysDifference * 24 * 60 * 60
          );
        }
        updatedSchedules[j] = newSchedule;
        startDate = nextDate(startDate);
      }
      // console.log(updatedSchedules);
      setSchedules(updatedSchedules);
      storeDataString(
        userInfo.email + "_schedules",
        JSON.stringify(updatedSchedules)
      );
    })();
  }, []);

  // check norification permission
  useEffect(() => {
    (async () => {
      let token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
    })();
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [isFocused, appStateVisible]);
  // location permission
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        goToSettings(
          "Require location sharing",
          "The app requires to access to your location when you are using the app. Please enable location permission in Settings."
        );
        return false;
      }

      let backPerm = await Location.requestBackgroundPermissionsAsync();
      console.log(backPerm);
    })();
  }, []);

  const handleLongPress = () => {
    Alert.alert(
      "Reset your notification schedules",
      "You should only reset your notification schedules if the notifications do not work.",
      [
        { text: "Cancel" },
        {
          text: "Reset",
          onPress: async () => {
            Notifications.cancelAllScheduledNotificationsAsync();
            storeDataString(userInfo.email + "_schedules", "");
          },
        },
      ]
    );
  };

  // update schedules when return to home screen (like after a questionnaire)
  useEffect(() => {
    (async () => {
      let sche = (await retrieveDataString(userInfo.email + "_schedules"))!;
      setSchedules(JSON.parse(sche));
    })();
  }, [isFocused, appStateVisible]);

  // update isAvailable status and update items on the screen
  useEffect(() => {
    if (schedules) {
      setIsAvailable(
        inQuestionnaireOpenInterval(new Date(), schedules[0].notificationTime)
      );
      updateStatus();
    }
  }, [schedules]);

  return (
    <ImageBackground
      source={require("../assets/images/home4.png")}
      resizeMode="cover"
      style={styles.image}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View style={styles.container}>
          <View style={[styles.frameContainerQ, styles.shadowProp]}>
            <Text style={styles.title}>
              {ready()
                ? "Your questionnaire is available"
                : "Your next questionnaire is not yet available"}
            </Text>
            {/* <LinearGradient
              colors={["#9EC5E5", "#428FC5"]}
              // style={styles.button}
              start={{ x: 0.1, y: -0.5 }}
              end={{ x: 0.8, y: 4 }}
            > */}
            <TouchableOpacity
              style={[
                ready() ? styles.buttonDeep : styles.button,
                styles.shadowPropButton,
              ]}
              onLongPress={handleLongPress}
              onPress={() => {
                if (ready()) {
                  navigation.navigate("Questionnaire");
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonTextWhite}>
                {ready() ? "Start" : "Not Available"}
              </Text>
            </TouchableOpacity>
            {/* </LinearGradient> */}

            {/* <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                Notifications.cancelAllScheduledNotificationsAsync();
                storeDataString(userInfo.email + "_schedules", "");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonTextWhite}>Reset</Text>
            </TouchableOpacity> */}
          </View>
          <View style={[styles.frameContainer, styles.shadowProp]}>
            <Text style={styles.title}>
              Questionnaire status: {schedules ? schedules[0].date : ""}
            </Text>
            <LinearGradient
              colors={statusColor(status.q1)}
              style={styles.status}
              start={{ x: 0.5, y: 4 }}
              end={{ x: 1.5, y: 0 }}
            >
              <Text style={styles.statusText}>
                {" "}
                {status.q1 == -1
                  ? schedules
                    ? "The 1st questionnaire will open at " +
                      convert24HourTo12(schedules[0].notificationTime[0])
                    : "The 1st questionnaire is not available yet"
                  : status.q1 == 0
                  ? "You've missed the 1st questionnaire"
                  : status.q1 == 1
                  ? "You've completed the 1st questionnaire"
                  : "The 1st questionnaire is now open"}
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={statusColor(status.q2)}
              style={styles.status}
              start={{ x: 0.5, y: 4 }}
              end={{ x: 1.5, y: 0 }}
            >
              <Text style={styles.statusText}>
                {status.q2 == -1
                  ? schedules
                    ? "The 2nd questionnaire will open at " +
                      convert24HourTo12(schedules[0].notificationTime[1])
                    : "The 2nd questionnaire is not available yet"
                  : status.q2 == 0
                  ? "You've missed the 2nd questionnaire"
                  : status.q2 == 1
                  ? "You've completed the 2nd questionnaire"
                  : "The 2nd questionnaire is now open"}
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={statusColor(status.q3)}
              style={styles.status}
              start={{ x: 0.5, y: 4 }}
              end={{ x: 1.5, y: 0 }}
            >
              <Text style={styles.statusText}>
                {status.q3 == -1
                  ? schedules
                    ? "The 3rd questionnaire will open at " +
                      convert24HourTo12(schedules[0].notificationTime[2])
                    : "The 3rd questionnaire is not available yet"
                  : status.q3 == 0
                  ? "You've missed the 3rd questionnaire"
                  : status.q3 == 1
                  ? "You've completed the 3rd questionnaire"
                  : "The 3rd questionnaire is now open"}
              </Text>
            </LinearGradient>
            {/* 
            <Text>
              {schedules
                ? "Date:" +
                  schedules[0].date +
                  ", sleep schedule: " +
                  wakeTime +
                  "-" +
                  sleepTime +
                  "\n" +
                  "Morning Block" +
                  schedules[0].timeBlocks[0].begin +
                  "-" +
                  schedules[0].timeBlocks[0].end +
                  ", available at " +
                  schedules[0].notificationTime[0] +
                  ", completed " +
                  schedules[0].completed[0] +
                  "\n" +
                  "Midday Block: " +
                  schedules[0].timeBlocks[1].begin +
                  "-" +
                  schedules[0].timeBlocks[1].end +
                  ", available at " +
                  schedules[0].notificationTime[1] +
                  ", completed " +
                  schedules[0].completed[1] +
                  "\n" +
                  "Evening Block: " +
                  schedules[0].timeBlocks[2].begin +
                  "-" +
                  schedules[0].timeBlocks[2].end +
                  ", available at " +
                  schedules[0].notificationTime[2] +
                  ", completed " +
                  schedules[0].completed[2] +
                  "\n"
                : " "}
            </Text> */}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.8,
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#FFFFFF00",
  },
  frameContainerQ: {
    width: "88%",
    flex: 0.2,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-evenly",
    //justifyContent: "center",
    alignItems: "center",
    //alignContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 32,
  },
  frameContainer: {
    width: "88%",
    flex: 0.2,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    //justifyContent: "center",
    alignItems: "center",
    //alignContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 32,
  },
  shadowProp: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  shadowPropButton: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  status: {
    width: 300,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#082B48",
    textAlign: "center",
  },
  blackText: {
    fontSize: 14,
    color: "#000000",
  },
  headTextLeft: {
    textAlign: "left",
    fontSize: 18,
    color: "#000000",
    //paddingLeft: 8,
  },
  headTextRight: {
    textAlign: "right",
    fontSize: 18,
    //paddingRight: 8,
  },
  button: {
    width: 200,
    height: 55,
    backgroundColor: "#72B3BA",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 5,
  },
  button2: {
    width: 200,
    height: 55,
    backgroundColor: "#FFFFFF",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 0,
  },
  buttonDeep: {
    width: 200,
    height: 55,
    backgroundColor: "#068D9D",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 5,
  },
  buttonTextWhite: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  textWhite: {
    textAlign: "center",
    color: "#fff",
    fontSize: 15,
  },
  statusText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: 11.5,
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
  textInput: {
    width: "95%",
    color: "#072B4F",
    fontSize: 12,
    marginTop: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderBottomColor: "white",
  },
});
