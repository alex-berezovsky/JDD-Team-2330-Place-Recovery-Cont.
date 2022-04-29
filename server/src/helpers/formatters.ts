import { IAnswers } from "models/answer.model";
import { IUser } from "models/user.model";

function formatIAnswers(answer: IAnswers, userEmail: string, day: number) {
  const answers = answer.answers;
  const ansObj: any = {};
  ansObj.datetime = answer.datetime;
  ansObj.day = day;
  ansObj.blockIndex = answer.blockIndex;
  ansObj.email = userEmail;
  ansObj.questionnaire = answer.questionnaire;
  if (answer.location !== undefined) {
    ansObj.latitude = answer.location.latitude;
    ansObj.longitude = answer.location.longitude;
    ansObj.geoid = answer.location.geoid;
  } else {
    ansObj.latitude = `unknown`;
    ansObj.longitude = `unknown`;
    ansObj.geoid = "unknown";
  }

  for (let i = 0; i < answers.length; i++) {
    // ansObj[`questionId${i}`] = answers[i].questionId;
    ansObj[`answer${i}`] = answers[i].answer.toString();
  }

  return ansObj;
}

export function formatIAnswersSingleUser(user: IUser) {
  const answers: IAnswers[] = user.answers;
  const formattedAnswers: any[] = [];

  answers.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  for (let answer of answers) {
    if (formattedAnswers.length === 0) {
      formattedAnswers.push(formatIAnswers(answer, user.email, 0));
      continue;
    }
    const firstAnswer = formattedAnswers.at(0);
    formattedAnswers.push(
      formatIAnswers(
        answer,
        user.email,
        getDateDifference(answer.datetime, firstAnswer.datetime)
      )
    );
  }

  return formattedAnswers.sort(
    (a, b) => Object.keys(b).length - Object.keys(a).length
  );
}

export function formatIAnswersMultipleUsers(users: IUser[]) {
  const formattedAnswers: any[] = [];
  for (const user of users) {
    formattedAnswers.push(...formatIAnswersSingleUser(user));
  }

  return formattedAnswers.sort(
    (a, b) => Object.keys(b).length - Object.keys(a).length
  );
}

function getDateDifference(a: Date, b: Date) {
  const diffTime = Math.abs(a.getTime() - b.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function checkSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
