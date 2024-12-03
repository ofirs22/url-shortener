import mongoose, { Schema, Document } from 'mongoose';
import { calculateNext30DaysCron } from '../utils/next30DaysCron';

export interface IUrl extends Document {
  longUrl: string;
  shortUrl: string;
  analytics: {
    clicks: number;
    lastAccessed: Date | null;
  };
  userId?: string;
  expiry: Date;
}

const UrlSchema: Schema = new Schema({
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  analytics: { type: Object, default: {
    clicks: 0,
    lastAccessed: null,
  } },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  expiry: {type: Date, default: () => {
    const now = new Date();
    now.setDate(now.getDate() + 30); // Add 30 days
    return now;
  }}
});

export default mongoose.model<IUrl>('Url', UrlSchema);