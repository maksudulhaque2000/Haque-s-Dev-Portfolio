import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    technologies: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Experience: Model<IExperience> =
  mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);

export default Experience;
