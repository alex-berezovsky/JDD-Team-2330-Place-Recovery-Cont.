# Server of Neighborhood

## How to install

### Prerequisites
- Need node 16

### Steps
1. `cd` into the *server* folder
2. run `npm install`
3. run `npm run decrypt ____` replacing `____` with the password
5. run `npm start`
6. ????
7. profit

## Endpoints

### Auth
- Login [POST]: /api/auth/login
    - Body
        - email
        - password
- Signup [POST]: /api/auth/signup
    - Body
        - email
        - password
        - firstName
        - lastName
        - phoneNumber?
        - address?
        - city?
        - state?
        - zip?
        - gender?
        - race?
        - birthday?
        - wakeTime
        - sleepTime
- Update [PUT]: /api/auth/update
    - Body (all optional)
        - email
        - firstName
        - lastName
        - phoneNumber
        - address
        - city
        - state
        - zip
        - longAddress
        - longCity
        - longState
        - longZip
        - gender
        - race
        - birthday
        - wakeTime
        - sleepTime
        - occupation
        - education
        - numberOfMoves
        - personalHistoryIllness
        - familyHistoryIllness
- User [GET]: /api/auth/user
    - Header
        - authorization
- Token Test [GET]: /api/auth/jwt-test
    - Header
        - authorization
- Get Reset [GET]: /api/auth/get-reset
    - Query
        - email
- Reset Password [POST]: /api/auth/resetpassword
    - Body
        - email
        - resetCode
        - newPassword

### Questionnaire
- Create [POST]: /api/question/create
    - Body
        - id
        - questions
- Question Retrieval [GET]: /api/question/:question
    - Just put the name of the question file as part of the URL
- Answer [POST]: /api/question/answer/
    - Header
        - authorization
    - Body
        - questionnaire
        - answers
        - location
- Answer [GET]: /api/question/answer/:timeframe?
    - Header
        - authorization
    - Params
        - timeframe: ["thisweek", "frommonday"]


### Data
- Users [GET]: /api/data/users
- Answers User [GET]: /api/data/answers/:user
    - Params
        - user: user id
- Answers All Users [GET]: /api/data/answers/all
- Answer [GET]: /api/data/myuser
    - Header
        - authorization
- Delete Users [DELETE]: /api/data/deleteAllUsers
- Delete Answers [DELETE]: /api/data/deleteAllAnswers

## Endpoints to add

### Profile

- [GET]requests
  - Phone Number
  - Address
  - Gender
  - Race/Ethnicity

- [POST] requests updating profile information
   - Phone Number
   - Address 1
   - City
   - State
   - Zip Code
   - Gender 
   - Race/Ethnicity

### Demographics Form

- [POST] 
  - Education
  - Occupation
  - Address where the user lived the longest(Address 1)
  - City
  - State
  - Zip code 
  - Number of times a participant moved
  - Family History of mental illness - array
  - Other
  - Personal History of mental illness - array
  - Other
### Auth
- Signup [POST]: /api/auth/signup
    - Body
        - email
        - password
        - firstName
        - lastName
        - phoneNumber
        - address line 1
        - city
        - state
        - zip code
        - date of birth
        - gender
        - race/ethnicity