"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import Interaction from "@/database/interaction.model";
import User from "@/database/user.model";
import { auth } from "@clerk/nextjs";

export const createAnswer = async (params: CreateAnswerParams) => {
  try {
    await connectToDatabase();

    const { content, author, question, path } = params;

    const user = await User.findById(author);
    if (user?.isBanned) {
      throw new Error("Your account has been banned. You cannot create answers.");
    }

    const newAnswer = await Answer.create({
      content,
      author,
      question,
    });

    // add answer to questions answer array
    const questionObject = await Question.findByIdAndUpdate(
      question, // question is the id of the question to which this answer id for
      {
        $push: {
          answers: newAnswer._id,
        },
      }
    );

    // ? add interaction

    await Interaction.create({
      user: author,
      action: "answer",
      question,
      tags: questionObject.tags,
      answer: newAnswer._id,
    });

    //  increase author's reputation +10 points for answering a question
    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function getAnswers(params: GetAnswersParams) {
  try {
    await connectToDatabase();

    const { questionId, sortBy, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    let sortOptions = {};

    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;

      default:
        break;
    }

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalAnswer = await Answer.countDocuments({
      question: questionId,
    });

    const isNext = totalAnswer > skipAmount + answers.length;

    return { answers, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    const user = await User.findById(userId);
    if (user?.isBanned) {
      throw new Error("Your account has been banned. You cannot vote.");
    }

    let updateQuery = {};

    if (hasupVoted) {
      // if i click on the upvote even though ive already upvoted then simply remouve/pull my upvote: in other words un-upvote
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        // if i try to upvote although i hve downvoted prevously then pull(remove) my userId from downvotes set and push it into upvote set
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      // if im upvoting for 1st time, my userId (the one who's upvoting will be created in the upvote section)
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    // create new doc after updating upvotes
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    //  increment author's reputation +2 points for upvoting an answer
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -2 : 2 },
    });

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasupVoted ? -10 : 10 },
    });



    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    const user = await User.findById(userId);
    if (user?.isBanned) {
      throw new Error("Your account has been banned. You cannot vote.");
    }

    let updateQuery = {};

    // same logic as upvoted
    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    //  decrease author's reputation

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownVoted ? -2 : 2 }
    });

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasdownVoted ? -10 : 10 }
    });
    

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const deleteAnswer = async (params: DeleteAnswerParams) => {
  try {
    await connectToDatabase();
    const { answerId, path } = params;
    const { userId: clerkId } = auth();

    if (!clerkId) throw new Error("Unauthorized");

    const mongoUser = await User.findOne({ clerkId });
    if (!mongoUser) throw new Error("User not found");

    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error("No answer found");

    const isAuthor = answer.author.toString() === mongoUser._id.toString();
    const isModerator = mongoUser.role === "moderator";
    const isAdmin = mongoUser.role === "admin";

    if (!isAuthor && !isModerator && !isAdmin) {
      throw new Error("Unauthorized");
    }

    await answer.deleteOne({ _id: answerId });
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    );
    await Interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
