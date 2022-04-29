import { Schema, model } from "mongoose";

export interface IAnswer {
  questionId: string;
  answer: string | number | string[] | number[];
  choiceIndex: number | number[];
}

export interface IAnswers {
  datetime: Date;
  questionnaire: string;
  answers: IAnswer[];
  location: ILocation;
  blockIndex: number;
}

export interface ILocation {
  latitude: number;
  longitude: number;
  geoid: string;
}

export const LocationSchema = new Schema<ILocation>({
  latitude: { type: Number },
  longitude: { type: Number },
  geoid: { type: String },
});

export const AnswersSchema = new Schema<IAnswers>({
  datetime: { type: Date, required: true },
  questionnaire: { type: String, required: true },
  answers: [
    {
      questionId: { type: String, required: true },
      answer: { type: Schema.Types.Mixed, required: true },
      choiceIndex: { type: Schema.Types.Mixed, required: true },
    },
  ],
  location: { type: LocationSchema },
  blockIndex: { type: Number, required: true },
});

export default model<IAnswers>("Answers", AnswersSchema);
