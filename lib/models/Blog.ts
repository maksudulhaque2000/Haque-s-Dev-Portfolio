import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment {
  id: string;
  name: string;
  email: string;
  comment: string;
  createdAt: Date;
}

export interface IReaction {
  like?: { count: number; users: string[] };
  love?: { count: number; users: string[] };
  celebrate?: { count: number; users: string[] };
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  author: string;
  published: boolean;
  reactions: IReaction;
  comments: IComment[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ReactionSchema = new Schema({
  like: {
    count: { type: Number, default: 0 },
    users: [String],
  },
  love: {
    count: { type: Number, default: 0 },
    users: [String],
  },
  celebrate: {
    count: { type: Number, default: 0 },
    users: [String],
  },
}, { _id: false });

const BlogSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    author: {
      type: String,
      required: true,
      default: 'Maksudul Haque',
    },
    published: {
      type: Boolean,
      default: false,
    },
    reactions: {
      type: ReactionSchema,
      default: {
        like: { count: 0, users: [] },
        love: { count: 0, users: [] },
        celebrate: { count: 0, users: [] },
      },
    },
    comments: [CommentSchema],
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
