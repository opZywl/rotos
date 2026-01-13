import { Document, Schema, model, models } from "mongoose";

export interface INotification extends Document {
  recipient: Schema.Types.ObjectId;
  type: 'POST_DELETED' | 'POST_EDITED' | 'COMMENT_ADDED' | 'USER_TAGS_UPDATED' | 'ROLE_UPDATED';
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['POST_DELETED', 'POST_EDITED', 'COMMENT_ADDED', 'USER_TAGS_UPDATED', 'ROLE_UPDATED'] 
  },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = models.Notification || model('Notification', NotificationSchema);

export default Notification;
