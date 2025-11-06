import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'frontend' | 'backend' | 'other';
  icon?: string;
  proficiency?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'other'],
      required: true,
    },
    icon: {
      type: String,
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Skill: Model<ISkill> = mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);

export default Skill;
