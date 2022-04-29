import express, { Request, Response } from "express";
import { format } from "@fast-csv/format";
const router = express.Router();

import User from "models/user.model";
import { verify } from "middleware";
import {
  formatIAnswersMultipleUsers,
  formatIAnswersSingleUser,
} from "helpers/formatters";

router.get("/users", async (req, res: Response) => {
  try {
    const users = await User.find({}).select(
      "-answers -password -resetCode -resetTries -__v"
    );
    const csvStream = format({ headers: true });
    res.attachment("users.csv");
    res.type("text/csv");
    csvStream.pipe(res);
    for (const user of users) {
      csvStream.write(user.toObject());
    }
    csvStream.end();
  } catch (error: any) {
    console.error(error);
    res.status(error.httpCode || 500).json(error);
  }
});

router.get("/answers/:user", async (req, res: Response) => {
  try {
    const userId = req.params.user;
    let answers;
    if (userId === "all") {
      const users = await User.find({}).select("answers email");
      answers = formatIAnswersMultipleUsers(users);
      res.attachment(`All_Users_Answers.csv`);
    } else {
      const user = await User.findOne({ _id: userId }).select("answers email");
      answers = formatIAnswersSingleUser(user);
      res.attachment(`${user.lastName}_${user.firstName}_Answers.csv`);
    }

    const csvStream = format({ headers: true });

    res.type("text/csv");
    csvStream.pipe(res);
    for (const answer of answers) {
      csvStream.write(answer);
    }
    csvStream.end();
  } catch (error: any) {
    console.error(error);
    res.status(error.httpCode || 500).json(error);
  }
});

router.delete("/deleteAllUsers", async (req, res: Response) => {
  try {
    await User.deleteMany({ admin: { $ne: true } });

    res.status(200).json("Successfully deleted users.");
  } catch (error: any) {
    console.error(error);
    res.status(error.httpCode || 500).json(error);
  }
});

router.delete("/deleteAllAnswers", async (req, res: Response) => {
  try {
    await User.updateMany({ admin: { $ne: true } }, { $set: { answers: [] } });

    res.status(200).json("Successfully deleted answers.");
  } catch (error: any) {
    console.error(error);
    res.status(error.httpCode || 500).json(error);
  }
});

router.get("/myuser", verify, (req, res: Response) => {
  res.status(200).json(req.currentUser);
});

export default router;