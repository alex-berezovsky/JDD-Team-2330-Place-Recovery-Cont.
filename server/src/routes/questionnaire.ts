import express, { Request, Response } from "express";
import { writeFile, access } from "fs/promises";
import path from "path";
const router = express.Router();

import Answers from "models/answer.model";
import User, { IUser } from "models/user.model";
import { verify } from "middleware";

import {
  validateAnswerArray,
  validateLocation,
  validateQuestionArray,
} from "helpers/validators";
const questionsPath = path.resolve(__dirname, "..", "public", "questions");

router.post("/create", verify, async (req, res: Response) => {
  try {
    const user: IUser = req.currentUser;
    if (!user.admin) {
      throw {
        httpCode: 403,
        message: `user is not an admin.`,
        error: new Error(`user is not an admin.`),
      };
    }
    const { questions, id }: { questions: any[]; id: string } = req.body;
    if (!validateQuestionArray(questions)) {
      throw {
        httpCode: 400,
        message: `question format is incorrect.`,
        error: new Error(`question format is incorrect.`),
      };
    }

    const questionSaveFile = path.join(questionsPath, `${id}.json`);
    await writeFile(questionSaveFile, JSON.stringify(questions));

    res.status(200).json({ isValidRequest: true });
  } catch (error: any) {
    res.status(error.httpCode || 500).json(error);
  }
});

router.post("/answer", verify, async (req, res: Response) => {
  try {
    const user = await User.findOne({ email: req.currentUser.email });
    const { questionnaire, answers, location, blockIndex } = req.body;
    if (!validateAnswerArray(answers)) {
      throw {
        httpCode: 400,
        message: `answers format is incorrect.`,
        error: new Error(`answers format is incorrect.`),
      };
    }
    if (location !== undefined && !validateLocation(location)) {
      throw {
        httpCode: 400,
        message: `location format is incorrect.`,
        error: new Error(`location format is incorrect.`),
      };
    }

    const currentDateTime = new Date();
    const newAnswers = new Answers({
      datetime: currentDateTime.toISOString(),
      questionnaire,
      answers,
      location,
      blockIndex,
    });

    user.answers.push(newAnswers);
    await user.save();

    res.status(200).json({ storedAnswer: true });
  } catch (error: any) {
    console.error(error);
    res.status(error.httpCode || 500).json(error);
  }
});

router.get("/answer/:timeframe?", verify, async (req, res: Response) => {
  try {
    const user = await User.findOne({ email: req.currentUser.email });
    let { answers } = user;
    const { timeframe } = req.params;
    if (timeframe !== undefined) {
      const today = new Date();
      if (timeframe === "thisweek") {
        const diffDate = today.getDate() - today.getDay();
        const thisSunday = new Date(today.setDate(diffDate));
        answers = answers.filter(
          (answer) => new Date(answer.datetime) >= thisSunday
        );
      } else if(timeframe === "frommonday") {
        const thisDay = today.getDay();
        const diffDate = today.getDate() - thisDay + (thisDay === 0 ? -6 : 1);
        const thisMonday = new Date(today.setDate(diffDate));
        answers = answers.filter(
          (answer) => new Date(answer.datetime) >= thisMonday
        );
      }
    }
    res.status(200).json({ answers });
  } catch (error: any) {
    console.error(error);
    res.status(error.httpCode || 500).json(error);
  }
});

router.get("/:questionnaire", async (req: Request, res: Response) => {
  try {
    const { questionnaire } = req.params;
    const questionSaveFile = path.join(questionsPath, questionnaire);
    await access(questionSaveFile);
    res.header("Content-Type", "application/json");
    res.sendFile(questionSaveFile);
  } catch (error: any) {
    res.status(error.httpCode || 500).json(error);
  }
});

export default router;
