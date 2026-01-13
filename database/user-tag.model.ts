import { Document, Schema, model, models } from "mongoose";

export interface IUserTag extends Document {
  name: string;
  color: string;
  createdAt: Date;
}

const UserTagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, required: true }, // RGB or Hex color
  createdAt: { type: Date, default: Date.now },
});

const UserTag = models.UserTag || model("UserTag", UserTagSchema);

export default UserTag;
