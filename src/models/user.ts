import { model, models, Schema } from "mongoose";

interface UserType {
  name: string;
  password: string;
  refreshToken: string[];
}

const userSchema = new Schema<UserType>({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // exist different end
  refreshToken: [String],
});

export const Users = models.Users || model("Users", userSchema);
