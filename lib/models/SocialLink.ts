import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISocialLink extends Document {
  name: string;
  url: string;
  icon: string; // Icon name from lucide-react
  order: number; // For sorting
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SocialLink: Model<ISocialLink> =
  mongoose.models.SocialLink || mongoose.model<ISocialLink>('SocialLink', SocialLinkSchema);

export default SocialLink;

