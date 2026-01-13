"use server";

import { connectToDatabase } from "../mongoose";
import UserTag from "@/database/user-tag.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs";
import { 
  CreateUserTagParams, 
  UpdateUserTagParams, 
  DeleteUserTagParams, 
  AssignUserTagParams 
} from "./shared.types";

/**
 * Ensures the requester is an Admin or Owner
 */
async function validateStaffAccess() {
  const { userId: clerkId } = auth();
  if (!clerkId) throw new Error("Unauthorized");

  await connectToDatabase();
  const user = await User.findOne({ clerkId });
  
  if (!user || !["admin", "owner"].includes(user.role)) {
    throw new Error("Unauthorized: Staff access required (Admin/Owner)");
  }
  
  return user;
}

export async function createUserTag(params: CreateUserTagParams) {
  try {
    await validateStaffAccess();
    const { name, color, path } = params;

    await UserTag.create({ name, color });

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateUserTag(params: UpdateUserTagParams) {
  try {
    await validateStaffAccess();
    const { tagId, name, color, path } = params;

    await UserTag.findByIdAndUpdate(tagId, { name, color });

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteUserTag(params: DeleteUserTagParams) {
  try {
    await validateStaffAccess();
    const { tagId, path } = params;

    // Remove this tag from all users first
    await User.updateMany(
      { userTags: tagId },
      { $pull: { userTags: tagId } }
    );

    await UserTag.findByIdAndDelete(tagId);

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllUserTags() {
  try {
    await connectToDatabase();
    const tags = await UserTag.find({}).sort({ createdAt: -1 });
    return tags;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function assignUserTags(params: AssignUserTagParams) {
  try {
    await validateStaffAccess();
    const { userId, tagIds, path } = params;

    await User.findByIdAndUpdate(userId, { 
      $set: { userTags: tagIds } 
    });

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
