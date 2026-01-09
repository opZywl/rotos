"use server";

import { FilterQuery } from "mongoose";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import { BadgeCriteriaType } from "@/types";
import { assignBadges } from "../utils";
import { clerkClient } from "@clerk/nextjs/server";

export const getUserById = async (params: any) => {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getOrCreateUser = async (params: { userId: string }) => {
  try {
    await connectToDatabase();

    const { userId } = params;

    // Check if user exists in MongoDB by clerkId
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // User doesn't exist, fetch from Clerk and create
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";

      // Check if a user with this email already exists (e.g., from a previous deleted account)
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        // Update the existing user with the new clerkId (re-registration case)
        user = await User.findByIdAndUpdate(
            existingUserByEmail._id,
            {
              clerkId: userId,
              name: `${clerkUser.firstName || ""}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`.trim() || "User",
              picture: clerkUser.imageUrl,
              needsUsernameSetup: true,
            },
            { new: true }
        );
        return user;
      }

      // Generate unique username
      let username = clerkUser.username;
      if (!username) {
        // Generate a unique username with timestamp to avoid duplicates
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 6);
        username = `user_${timestamp}${randomStr}`;
      }

      // Check if username already exists and make it unique if needed
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        username = `${username}_${randomSuffix}`;
      }

      user = await User.create({
        clerkId: userId,
        name: `${clerkUser.firstName || ""}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`.trim() || "User",
        username,
        email,
        picture: clerkUser.imageUrl,
        needsUsernameSetup: true,
      });
    }

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function setupUsername(params: { clerkId: string; username: string }) {
  try {
    await connectToDatabase();

    const { clerkId, username } = params;

    // Check if username is valid (alphanumeric and underscore only, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return { error: "Username must be 3-20 characters and contain only letters, numbers, and underscores" };
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username, clerkId: { $ne: clerkId } });
    if (existingUser) {
      return { error: "Username is already taken" };
    }

    // Update the user's username and mark setup as complete
    const updatedUser = await User.findOneAndUpdate(
        { clerkId },
        { username, needsUsernameSetup: false },
        { new: true }
    );

    if (!updatedUser) {
      return { error: "User not found" };
    }

    return { success: true, user: updatedUser };
  } catch (error) {
    console.log(error);
    return { error: "Failed to update username" };
  }
}

export async function checkUsernameAvailable(username: string) {
  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ username });
    return { available: !existingUser };
  } catch (error) {
    console.log(error);
    return { available: false };
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();
    const { clerkId } = params;

    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }

    // Delete all questions authored by this user
    await Question.deleteMany({ author: user._id });

    // Delete all answers authored by this user
    await Answer.deleteMany({ author: user._id });

    // Remove user's votes from all questions
    await Question.updateMany(
        { upvotes: user._id },
        { $pull: { upvotes: user._id } }
    );
    await Question.updateMany(
        { downvotes: user._id },
        { $pull: { downvotes: user._id } }
    );

    // Remove user's votes from all answers
    await Answer.updateMany(
        { upvotes: user._id },
        { $pull: { upvotes: user._id } }
    );
    await Answer.updateMany(
        { downvotes: user._id },
        { $pull: { downvotes: user._id } }
    );

    // Remove user from saved questions of other users
    await User.updateMany(
        { saved: { $in: [user._id] } },
        { $pull: { saved: user._id } }
    );

    // Delete all interactions by this user
    await Interaction.deleteMany({ user: user._id });

    // Finally delete the user
    const deletedUser = await User.findByIdAndDelete(user._id);

    // Revalidate the community page to reflect the deletion
    revalidatePath("/community");

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    const { page = 1, pageSize = 9, filter, searchQuery } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;
      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;
      case "top_contributors":
        sortOptions = { reputation: -1 };

        break;

      default:
        break;
    }

    const users = await User.find(query)
        .skip(skipAmount)
        .limit(pageSize)
        .sort(sortOptions);

    const totalUsers = await User.countDocuments(query);

    const isNext = totalUsers > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved: boolean = user.saved.includes(questionId);

    if (isQuestionSaved) {
      await User.findByIdAndUpdate(
          userId,
          {
            $pull: { saved: questionId },
          },
          { new: true }
      );
    } else {
      // add to saved
      await User.findByIdAndUpdate(
          userId,
          {
            $addToSet: { saved: questionId },
          },
          { new: true }
      );
    }
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();

    const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = searchQuery
        ? { title: { $regex: new RegExp(searchQuery, "i") } }
        : {};

    let sortOptions = {};

    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
        break;
      case "most_answered":
        sortOptions = { answers: -1 };
        break;

      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!user) {
      return { questions: [], isNext: false };
    }

    const isNext = user.saved.length > pageSize;
    const savedQuestions = user.saved;

    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getUserInfo = async (params: GetUserByIdParams) => {
  try {
    connectToDatabase();
    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return null;
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    // ? count question upvotes
    const [questionUpvotes] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upvotes" },
        },
      },
    ]);

    // ? count answer upvotes
    const [answerUpvotes] = await Answer.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upvotes" },
        },
      },
    ]);

    // ? count question views
    const [questionViwes] = await Question.aggregate([
      { $match: { author: user._id } },

      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    // calculation badge criteria
    const criteria = [
      { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
      { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
      {
        type: 'QUESTION_UPVOTES' as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0
      },
      {
        type: 'ANSWER_UPVOTES' as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0
      },
      {
        type: 'TOTAL_VIEWS' as BadgeCriteriaType,
        count: questionViwes?.totalViews || 0
      }
    ];

    // ? badge countes
    const badgeCounts = assignBadges({ criteria });

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserQuestions = async (params: GetUserStatsParams) => {
  try {
    connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;
    // pagination

    const skipAmount = (page - 1) * pageSize;

    const totalQuestions = await Question.countDocuments({ author: userId });

    const userQuestions = await Question.find({ author: userId })
        .skip(skipAmount)
        .limit(pageSize)
        .sort({
          createdAt: -1,
          views: -1,
          upvotes: -1,
        })
        .populate("tags", "_id name")
        .populate("author", "_id clerkId name picture");

    const isNextQuestion = totalQuestions > skipAmount + userQuestions.length;

    return { totalQuestions, userQuestions, isNextQuestion };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserAnswers = async (params: GetUserStatsParams) => {
  try {
    connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await Answer.countDocuments({ author: userId });
    const userAnswers = await Answer.find({ author: userId })
        .skip(skipAmount)
        .limit(pageSize)
        .sort({
          createdAt: -1,
          upvotes: -1,
        })
        .populate("question", "_id title")
        .populate("author", "_id clerkId name picture");

    const isNextAnswer = totalAnswers > skipAmount + userAnswers.length;

    return { totalAnswers, userAnswers, isNextAnswer };
  } catch (error) {
    console.log(error);
    throw error;
  }
};