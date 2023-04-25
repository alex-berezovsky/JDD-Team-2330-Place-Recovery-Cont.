<h1 align="center">Place&Recovery🧠 (GT Team 1358)</h1> <br>

<p align="center">
  <a href=""><img src="https://i.imgur.com/uGnMJIv.jpg" width ="450" title="source: imgur.com" /></a>
  </p>
<p align="center">
  <a href="https://github.com/DenverCoder1/readme-typing-svg"><img src="https://readme-typing-svg.herokuapp.com?&font=IBM+Plex+Sans&color=0f0f0f&size=20&lines=Track+Mental+health+Based+On+Neighborhood;Available+for+both+iOS+and+Android+platform" /></a>
</p>

<p align="center">
  <a href="https://itunes.apple.com/us/app/">
    <img alt="Download on the App Store" title="App Store" src="http://i.imgur.com/0n2zqHD.png" width="140">
  </a>
  <a href="https://play.google.com/store/apps/">
    <img alt="Get it on Google Play" title="Google Play" src="http://i.imgur.com/mtGRPuM.png" width="140">
  </a>
  </p>
  

![Release](https://img.shields.io/github/v/release/DorianLin/GT_1358_Project_Design?label=release)
[![Node](https://img.shields.io/node/v/react-native)](https://nodejs.org/en/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)


## Table of Contents

- [📖 Introduction](#Introduction)
- [🌟 Features](#Features)
- [❓Known Issues](#Known-Issues)
- [⚙️ Fixed Bugs](#Fixed-Bugs)
- [💻 How To Run ](#How-To-Run)
- [🔧 Frameworks and Tools](#Frameworks,-Tools,-and-Coding-Languages)
- [📄 License](#License)


## Introduction

The project is a mobile application for mental health and risk stratification based on neighborhood characteristics for both Apple and Android platforms. Virtually no research exists examining the daily influence of environmental factors on the development of mental health disorders such as schizophrenia. Our solution is a mobile app that collects real-time data (daily survey) on the status of the user’s mental health such as their feelings and emotions in relation to their location during the day. We can compile and organize this data into a database for our client and other clinicians to analyze and can better treat their own patients and gain knowledge of the development of mental health disorders.

**The app is available for both iOS and Android platforms.**
<p align="center">
<a href=""><img src="https://i.imgur.com/WigKAVH.jpg" width ="300"  title="source: imgur.com" /></a>
<br>
</p>

## Version 2.0.0
### Features
- No new features were added
- Sprint was dedicated towards getting the app on TestFlight
### Known Issues
- Background location tracking works on Android but not iOS
- Progress graphs do not update correctly with questionnaire submission
- Attempting to upload MongoDB data to spreadsheets causes a “file missing” error (file is index.js)
### Fixed Bugs
- Error regarding questionnaire submission has been resolved

## Version 1.4.0
### Features
- Ability to take the questionnaire at anytime added
- Response validation/data cleaning for questionnaire answers added
- Option to go back and change questionnaire answers added
- UI Improvements to profile page added
### Known Issues
- questionnaire submission sometimes causes an error
### Fixed Bugs
- Progress graphs are now correctly updating with questionnaire submission

## Version 1.3.0
### Features
- Background location tracking permissions functionality added
### Known Issues
- Nodejs build failing on github workflow
- Background location tracking on newer iPhone versions may fail under certain instances
### Fixed Bugs
- Heroku is now working properly and up and running
- Accessing the app has been fixed and login functionality has been restored
- Unrecognized Nodejs version for package.json fixed

## Version 1.2.0
### Features
- N/A for Sprint 2 (mainly focused on getting the app functioning)
### Known Issues
- Heroku web server still does not run (will be fixed as soon as possible, allowing for complete functionality of the app)
### Fixed Bugs
- Outdated libraries and packages are still there but are no longer a breaking issue
- Got remaining vulnerabilities down to 19 from 30

## Version 1.1.0
### Features
- N/A for Sprint 1  (mainly focused on getting the app functioning)
### Known Issues
- 54  packages in need of updates were identified.
- 47 vulnerabilities of varying criticality (3 low, 31 high, 5 critical)  were identified, and 17 were resolved. 30 vulnerabilities remain to be fixed.
- We were unable to run Heroku, which is necessary to run the app.
- Our team plans to resolve such compatibility and dependency issues with the outdated packages, libraries, and vulnerabilities within the next sprint.
### Fixed Bugs
- 17 vulnerabilities were resolved within this sprint, leaving 30 vulnerabilities for manual review in the next sprint.
- Issues regarding accessing MongoDB were resolved.

## Version 1.0.0
### Features
- The app can handle multiple free-response questions.
- The Home Screen can show the complete status of the questionnaire and the timeclock for the next questionnaire.
- The app only allows users to take questionnaires within the available period.
- The Welcome Screen that is displaying the general information and guidance for the user the first time opened the application.
- Users can reset notification schedules by long-pressing the button on the home page.
- A profile screen that can display the user's personal information and allow them to access the additional demographics form.
- The progress screen contains bar charts that will be used to illustrate the user's progress/trends.
- Client can export user data to CSV through links.
- Published the app to Apple App Store.
- Published the app to Google Play Store.
<p align="center">
<br>
<a href=""><img src="https://i.imgur.com/jpk1OKi.jpg" width ="450" title="source: imgur.com" /></a>
<br><br>
</p>

### Known Issues
- DateTimePicker has problems on Android, work fine on iOS.
- Haven't tested the case where there are no GPS signals.
- The notification might not work properly if the users change the system time. Users can reset notification schedules if the notification don't work.
- The notification works on Expo Go but seems have problem on iOS.

### Fixed Bugs
- Fixed locations not working on Android devices.


## How to Run
- First, make sure you have installed [Node 16 LTS](https://nodejs.org/en/download/) or greater installed.
- Install [Visual Studio Code](https://code.visualstudio.com/download)
- On Visual Studio Code: Create a new terminal via the Terminal menu with Terminal > New Terminal.
- Install the latest verion of Expo CLI: 
```bash 
npm i -g expo-cli
```

- Make sure you have downloaded the project files. Go under the project directory, and install all dependencies:
```bash
cd ./app/src
npm i
```
- Start the project with
```bash
expo start
``` 
- Scan the QR code with Expo Go (Android) or the Camera app (iOS) to run the app on your phone.
- To run the server locally,  go under the server directory:
```bash
cd ./server
```
- Then follow the instructions in `server/README.md` to run the server.
- To submit the app to Apple App Store and Google Play Store, please follow the [EAS Submit](https://docs.expo.dev/submit/introduction/) instructions. 

<img align='right' src='https://media.giphy.com/media/bcKmIWkUMCjVm/giphy.gif' width='200"'>

## Frameworks, Tools, and Coding Languages
<p align="center">

<a href="https://reactnative.dev"><img src="https://i.imgur.com/yAVbmC7.png" title="source: imgur.com" width="50" height="40"/></a><a href="https://www.typescriptlang.org"><img src="https://i.imgur.com/yq3HCqb.png" title="source: imgur.com" width="40" height="40"/></a>  <a href="https://www.javascript.com"><img src="https://i.imgur.com/vhKEVIX.png" title="source: imgur.com"  width="40" height="40"/></a> <a href="https://www.mongodb.com"><img src="https://i.imgur.com/9FCPyh8.png" title="source: imgur.com" width="40" height="40"/></a>  <a href="https://nodejs.org/en/"><img src="https://i.imgur.com/cACDNTD.png" title="source: imgur.com" width="40" height="40"/></a>
</p>

## License
This project is licensed under the [MIT license](LICENSE).

## Troubleshooting
1.	Users can’t receive notification.
- Notification seems to have bugs after we did beta testing on Apple TestFlight. Users can try to reset their notification schedules by long pressing the “Not Available” or “Start” button on the home screen. There will be an option to reset the notification. Please reload the app after reset.
2.	The app can’t automatically sign in or can’t load the questionnaire. 
- When opening the app, the app should be able to automatically sign users in if they have signed in before. However, the app currently doesn’t have a loading screen, so the users might need to wait a few seconds depending on the network conditions.
3.	Users can’t submit the questionnaire.
- The app will fetch users’ location when they are answering the questionnaire. When the click “Submit”, the app will check if the location is fetched. If not, it might take a few seconds to fetch the location again and upload the answers to backend (which can also take a few seconds depending on the network conditions). Users can wait a few seconds and the answers should be recorded automatically. 
4.	Some Android users might can’t submit questionnaire.
- This is a problem of expo-location (a package we used) on some Android devices. During our beta testing, we identified the problem and tried to fix it, and the location services worked on the Android device we used. However, there might be some edge cases for other Android devices that we haven’t tested on. GitHub Issue of expo-location: https://github.com/expo/expo/issues/946 ; Possible solution: https://docs.google.com/document/d/1emsj507egcqQrHfAA-i4lf_f0Vk_tf7zZ1jwkaFZBGA/edit 

