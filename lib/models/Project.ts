import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  githubId: number;
  name: string;
  description: string;
  url?: string;
  homepage?: string;
  language?: string;
  languages?: string[];
  topics?: string[];
  technologies: string[];
  category: 'fullstack' | 'frontend' | 'backend' | 'other';
  isApproved: boolean;
  featured?: boolean;
  githubUrl: string;
  image?: string;
  languagePercentages?: { [key: string]: number }; // Language usage percentages
  updatedAt: Date;
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    githubId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    homepage: {
      type: String,
    },
    language: {
      type: String,
    },
    languages: [String],
    topics: [String],
    technologies: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      enum: ['fullstack', 'frontend', 'backend', 'other'],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    githubUrl: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    languagePercentages: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
