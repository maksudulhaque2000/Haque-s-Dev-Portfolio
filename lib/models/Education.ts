import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEducation extends Document {
  degree: string;
  institution: string;
  duration: string;
  description: string;
  achievements: string[];
  certificate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema: Schema = new Schema(
  {
    degree: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    achievements: {
      type: [String],
      default: [],
    },
    certificate: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Education: Model<IEducation> =
  mongoose.models.Education || mongoose.model<IEducation>('Education', EducationSchema);

export default Education;
