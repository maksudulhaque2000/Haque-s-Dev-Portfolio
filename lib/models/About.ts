import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILanguage {
  name: string;
  proficiency: number; // 0-100
}

export interface IInterest {
  name: string;
  icon?: string;
}

export interface IAbout extends Document {
  image: string;
  description: string;
  location: string;
  languages: ILanguage[];
  interests: IInterest[];
  updatedAt: Date;
}

const LanguageSchema = new Schema({
  name: { type: String, required: true },
  proficiency: { type: Number, required: true, min: 0, max: 100 },
});

const InterestSchema = new Schema({
  name: { type: String, required: true },
  icon: { type: String },
});

const AboutSchema: Schema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      default: 'Dhaka, Bangladesh',
    },
    languages: [LanguageSchema],
    interests: [InterestSchema],
  },
  {
    timestamps: true,
  }
);

const About: Model<IAbout> = mongoose.models.About || mongoose.model<IAbout>('About', AboutSchema);

export default About;
