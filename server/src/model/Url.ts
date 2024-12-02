import mongoose, { Schema, Document } from 'mongoose';

export interface IUrl extends Document {
  longUrl: string;
  shortUrl: string;
  analytics: {
    clicks: number;
    lastAccessed: Date | null;
  };
  userId?: string
}

const UrlSchema: Schema = new Schema({
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  analytics: { type: Object, default: {
    clicks: 0,
    lastAccessed: null,
  } },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
});

export default mongoose.model<IUrl>('Url', UrlSchema);