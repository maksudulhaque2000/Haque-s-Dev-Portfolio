import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHome extends Document {
  profileImage: string;
  name: string;
  title: string;
  description: string;
  resumeLink?: string;
  updatedAt: Date;
}

const HomeSchema: Schema = new Schema(
  {
    profileImage: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Maksudul Haque / মাকসুদুল হক',
    },
    title: {
      type: String,
      required: true,
      default: 'Student | Web Developer | Competitive Programmer | Problem Solver',
    },
    description: {
      type: String,
      required: true,
    },
    resumeLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Home: Model<IHome> = mongoose.models.Home || mongoose.model<IHome>('Home', HomeSchema);

export default Home;
