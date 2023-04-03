import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { getItemAsync } from "expo-secure-store";

import { TextInput } from "react-native-gesture-handler";
import {
  inQuestionnaireOpenInterval,
  retrieveDataString,
  storeDataString,
} from "../components/Helpers";
import { AuthContext } from "../navigation/context";

import { backendUrl } from "../config/config.json";

// import qs_js from "./sample_question.json";

import * as Location from "expo-location";
import { LocationGeocodedAddress, LocationObject } from "expo-location";
import { convertTime, goToSettings } from "../components/Helpers";
import { DaySchedule } from "../components/types";

export default function Questionnaire({ navigation }) {
  const { useState } = React;
  const [txt, setTxt] = useState('');
  const [questions, setQuestions] = useState();
  const [length, setLength] = useState(0);
  const [index, setIndex] = useState(-1);
  const [prevIndex, setPrevIndex] = useState(-1);
  const [nextButton, setNextButton] = useState(true);
  const [buttonPressed, setButtonPressed] = useState(
    Array.from({ length: 20 }, (i) => false)
  );
  const questionnaire = "sampleq1";

  const [submitted, setSubmitted] = useState(false);
  const [user_answers, setUserAnswers]: [answer_type[], Function] = useState(
    []
  );

  const [location, setLocation] = useState<LocationObject>();
  const [fetching, setFetching] = useState(false);

  const { userInfo } = useContext(AuthContext);

  const [blockIdx, setBlockIdx] = useState<number>(-1);

  interface answer_type {
    choiceIndex: Number | Array<number>;
    answer: String | number | Array<String> | Array<number> | multiple_answer;
    questionId: String;
  }

  interface multiple_answer {
    From: String;
    To: String;
    Reason: String;
  }

  const [multiple_answers, setmultiple_answer] = useState({
    From: String,
    To: String,
    Reason: String,
  });

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      goToSettings(
        "Require location sharing",
        "The app requires to access to your location when you are using the app. Please enable location permission in Settings."
      );
      return false;
    }
    // TODO: should probably set timeout?
    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
      timeInterval: 1000,
    });
    console.log(location);
    // let address = await Location.reverseGeocodeAsync(location.coords);
    setLocation(location);
    return true;
  };

  const buttonFunction = (index: number) => {
    setButtonPressed((arr) =>
      arr.map((buttonPressed, i) =>
        i == index ? !buttonPressed : buttonPressed
      )
    );

    setButtonPressed((arr) =>
      arr.map((buttonPressed, i) =>
        i != prevIndex ? buttonPressed : !buttonPressed
      )
    );
    setPrevIndex(index);
    console.log(index);

    console.log(nextButton);
    if (index < 0) {
      setNextButton(true);
    } else {
      setNextButton(false);
    }
  };

  const multipleButtonFunction = (index: number) => {
    let count = 0;
    let checkBool = 0;
    setButtonPressed((arr) =>
      arr.map((buttonPressed, i) =>
        i == index ? !buttonPressed : buttonPressed
      )
    );
    buttonPressed.map((prop, index) => {
      if (buttonPressed[index] == false) {
        count++;
      } else {
        checkBool = index;
      }
    });

    console.log(count);

    console.log(index);
    console.log(checkBool);
    //console.log(prevIndex);
    //console.log(nextButton)
    if (index < 0) {
      setNextButton(true);
    } else {
      if (count == 19 && index == checkBool) {
        console.log("here");
        setNextButton(true);
        console.log(nextButton);
      } else {
        setNextButton(false);
      }
    }
  };

  const loadQuiz = async () => {
    try {
      await axios
        .get(`${backendUrl}/api/question/${questionnaire}.json`)
        .then((res) => {
          const sampleQuestions = res.data;
          setLength(sampleQuestions.length);
          setIndex(0);
          setQuestions(sampleQuestions);
          let arr = [];
          for (let i = 0; i < sampleQuestions.length; i++) {
            let mc = sampleQuestions[i]["type"] == 3 ? true : false;
            let value: answer_type = {
              choiceIndex: mc ? [] : -1,
              answer: mc ? [] : "",
              questionId: sampleQuestions[i]["id"],
            };
            arr.push(value);
          }
          setUserAnswers(arr);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const increase = () => {
    setNextButton(true);
    if (index < length - 1) {
      setIndex(index + 1);
    }
    setPrevIndex(-1);
    setButtonPressed((arr) =>
      arr.map((buttonPressed, i) => (buttonPressed = false))
    );
  };

  const decrease = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
    setPrevIndex(-1);
    setButtonPressed((arr) =>
      arr.map((buttonPressed, i) => (buttonPressed = false))
    );
  };

  useEffect(() => {
    (async () => {
      let sche = JSON.parse(
        (await retrieveDataString(userInfo.email + "_schedules"))!
      );
      let idx = inQuestionnaireOpenInterval(
        new Date(),
        sche[0].notificationTime
      );
      setBlockIdx(idx);
    })();
    loadQuiz();
    getLocation();
  }, []);
  

  const renderType0 = (i: number, customArray: null | Array<any> = null) => {
    return (customArray ? customArray : questions[i]["choices"]).map(
      (option, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => {
            buttonFunction(idx);
            // https://stackoverflow.com/questions/55987953/how-do-i-update-states-onchange-in-an-array-of-object-in-react-hooks
            let temp_answers = user_answers;
            temp_answers[i].answer = option;
            temp_answers[i].choiceIndex = idx;
            setUserAnswers(temp_answers);
            //console.log(user_answers);
          }}
          style={[
            styles.optionButton,
            buttonPressed[idx] == true
              ? { backgroundColor: "#184E77" }
              : styles.optionButton,
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{option}</Text>
        </TouchableOpacity>
      )
    );
  };

  const renderType1 = (i: number) => {
    let scales = [...Array(5).keys()].map((i) => i + 1);
    return renderType0(i, scales);
    // return <Sliders />;
  };
  const renderType2 = (i: number) => {
    return (
      <View>
        {renderType0(i)}
        <TextInput
          style={styles.input}
          placeholder="Other: (Numbers and Letters Only)"
          onChangeText={(freeText) => {
            let temp_answers = user_answers;
            // onInputChange(freeText);
            //freeText.replace(/[^0-9]/, '');
            //freeText.replace(/^[A-Za-z]+$/, '');
            freeText = freeText.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, " ");
            temp_answers[i].answer = freeText;
            
            temp_answers[i].choiceIndex = questions[i]["choices"].length;
            setUserAnswers(temp_answers);

            console.log(freeText);
          }}
        />
      </View>
    );
  };
  const renderType3 = (i: number) => {
    return questions[i]["choices"].map((option, idx) => (
      <TouchableOpacity
        key={idx}
        style={[
          styles.optionButton,
          buttonPressed[idx] == true
            ? { backgroundColor: "#184E77" }
            : styles.optionButton,
        ]}
        onPress={() => {
          let temp_answers = user_answers;
          temp_answers[i].answer.push(option);
          temp_answers[i].choiceIndex.push(idx);
          setUserAnswers(temp_answers);
          //console.log(user_answers);
          multipleButtonFunction(idx);
        }}
      >
        <Text style={styles.buttonText}>{option}</Text>
      </TouchableOpacity>
    ));
  };
  const renderType4 = (i: number) => {
    return (
      <TextInput
        style={styles.input}
        //placeholder="Answer here"
        onChangeText={(freeText) => {
          let temp_answers = user_answers;
          temp_answers[i].answer = freeText;
          //temp_answers[i].choiceIndex = questions[i]["choices"].length;
          setUserAnswers(temp_answers);

          //console.log(user_answers);
        }}
      />
    );
  };

  const renderType5 = (i: number) => {
    // 3 free responce, render yes and no button then fill the input box
    var temp_interface = {} as multiple_answer;
    return (
      <View>
        {renderType0(i)}
        <TextInput
          style={styles.input}
          placeholder="From:"
          onChangeText={(freeText) => {
            freeText = freeText.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, " ");
            temp_interface.From = freeText;
            let temp_answers = user_answers;
            temp_answers[i].answer = temp_interface;
            temp_answers[i].choiceIndex = questions[i]["choices"].length;
            setUserAnswers(temp_answers);
            console.log(freeText);
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="To:"
          onChangeText={(freeText) => {
            freeText = freeText.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, " ");
            temp_interface.To = freeText;
            let temp_answers = user_answers;
            temp_answers[i].answer = temp_interface;
            temp_answers[i].choiceIndex = questions[i]["choices"].length;
            setUserAnswers(temp_answers);
            console.log(freeText);
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Reason:"
          onChangeText={(freeText) => {
            freeText = freeText.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, " ");
            temp_interface.Reason = freeText;
            let temp_answers = user_answers;
            temp_answers[i].answer = temp_interface;
            temp_answers[i].choiceIndex = questions[i]["choices"].length;
            setUserAnswers(temp_answers);
            // console.log("user_answers is ");
            console.log(freeText);
          }}
        />
      </View>
    );
  };

    const onInputChange = e => {
      const { value } = e.target;
      console.log('Input value: ', value);
   
      const re1 = /^[A-Za-z]+$/;
      const re2 = /[^0-9]/g;
      if (value === "" || re1.test(value) || re2.test(value)) {
        setTxt(value);
      }
    }

  const renderQuestionList = (i: number) => {
    let type = questions[i]["type"];
    switch (type) {
      case 0:
        // console.log("type 0"); // multiple choice with single answer
        return renderType0(i);
      case 1:
        // console.log("type 1"); // scale question, from 1-5, continuous value, sliders
        return renderType1(i);
      case 2:
        // console.log("type 2"); // multiple choice with single answer that has additional free text box as last option
        return renderType2(i);
      case 3:
        // console.log("type 3"); // multiple choices, multiple select
        return renderType3(i);
      case 4:
        // single text entry
        return renderType4(i);
      case 5:
        return renderType5(i);
      default:
        console.log("unable to parse type");
    }

    return null;
  };

  const renderSubmit = () => {
    return (
      <TouchableOpacity
        style={submitted ? styles.disabledButton : styles.button}
        disabled={submitted}
        onPress={
          submitted
            ? () => {
                console.log("waiting");
              }
            : handleSubmit
        }
      >
        <Text style={styles.buttonText}> {submitted ? "Wait" : "Submit"}</Text>
      </TouchableOpacity>
    );
  };

  const handleSubmit = async () => {
    // TODO handle submit to endpoints
    // console.log("-------_***********_---------");
    setSubmitted(true);
    if (!location) {
      console.log("cant get location");
      await getLocation().then((res) => {
        if (!res) {
          console.log("fail to fetch location");
          // set deafult coordiantes
        } else {
          console.log("location is :", location);
        }
      });
    }
    try {
      const token: string = (await getItemAsync("user_token"))!;
      let longitude = 0;
      let latitude = 0;
      let geoid = undefined;
      if (location?.coords) {
        longitude = location?.coords.longitude;
        latitude = location?.coords.latitude;
        const geocensus = await axios.get(
          `https://geocoding.geo.census.gov/geocoder/geographies/coordinates`,
          {
            params: {
              benchmark: 4,
              vintage: 4,
              format: "json",
              x: longitude,
              y: latitude,
            },
          }
        );
        geoid =
          geocensus.data["result"]["geographies"]["Census Tracts"][0]["GEOID"];
      }

      const res = await axios.post(
        `${backendUrl}/api/question/answer`,
        {
          location: {
            longitude,
            latitude,
            geoid,
          },
          questionnaire,
          answers: user_answers,
          blockIndex: blockIdx,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      console.log(res.data);
      // console.log("submit");
      // console.log(blockIdx + " block");
      console.log(location);
      let sche: Array<DaySchedule> = JSON.parse(
        (await retrieveDataString(userInfo.email + "_schedules"))!
      );

      sche[0].timeBlocks[blockIdx].completed = true;
      sche[0].completed[blockIdx] = true;

      await storeDataString(
        userInfo.email + "_schedules",
        JSON.stringify(sche)
      );
      navigation.navigate("Home");
    } catch (error: any) {
      console.error("error:", error);
      console.error("error.data:", error.data);
      setSubmitted(false);
    }
    console.log("after try");
  };

  return (
    <View style={styles.container}>
      {/* If "question" is not null, execute this part of code */}
      {/* Those are buttons and questions */}
      {questions && (
        <View style={styles.parent}>
          <View style={styles.top}>
            <Text style={styles.question}>
              Q{index + 1}. {questions[index]["question"]}
            </Text>
          </View>

          <ScrollView>
            <View>{renderQuestionList(index)}</View>
          </ScrollView>

          <View style={styles.bottom}>
            {/* <TouchableOpacity style={styles.button} onPress={decrease}>
              <Text style={styles.buttonText}>PREVIOUS</Text>
            </TouchableOpacity> */}
            {index == length - 1 ? null : (
              <TouchableOpacity
                disabled={nextButton}
                style={nextButton ? styles.disabledButton : styles.button}
                onPress={increase}
              >
                <Text style={styles.buttonText}>NEXT</Text>
              </TouchableOpacity>
            )}
            {index == length - 1 ? renderSubmit() : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  top: {
    marginVertical: 16,
  },
  options: {
    marginVertical: 16,
    flex: 1,
  },
  bottom: {
    marginBottom: 5,
    paddingVertical: 5,
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#184E77",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    width: 100,
    height: 45,
  },
  disabledButton: {
    backgroundColor: "#184E77",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    opacity: 0.2,
    width: 100,
    height: 45,
  },
  buttonText: {
    fontSize: 15,
    color: "white",
  },
  question: {
    fontSize: 20,
  },
  option: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  optionButton: {
    width: "100%",
    height: 50,
    paddingVertical: 8,
    marginVertical: 8,
    backgroundColor: "#34A0A4",
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
  },
  parent: {
    height: "100%",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
