import httpStatus from "http-status";
import { Conversation, Message } from "./conversation.model";
import { TMessage } from "./conversation.interface";
import ApiError from "../../errors/ApiError";
import { User } from "../user/user.model";
import { configureModel } from "../configure/configure.model";
import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import { CONFIGURE_SEARCHABLE_FIELDS } from "../configure/configure.constant";
import { CONVERSATION_SEARCHABLE_FIELDS, MESSAGE_SEARCHABLE_FIELDS } from "./conversation.constant";

const createConversationIntoDB = async (id: string, platform: string) => {
  const result = await Conversation.create({
    name: "New Conversation",
    platform: platform,
    userId: id,
  });

  return result;
};
const addAMessage = async (payload: TMessage) => {


  if(!payload.userId){
    throw new ApiError(httpStatus.NOT_FOUND, "User id not found!")
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Step 1: Fetch config
    const configureData = await configureModel.findOne({}, null, { session });
    if (!configureData) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Configuration data not found"
      );
    }

    const pricePerToken = configureData.dollerPerToken;
    const tokenUsed = parseFloat((payload.price / pricePerToken).toFixed(10));

    // Step 2: Check user balance before proceeding
    const user = await User.findById(payload.userId, null, { session });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.token < tokenUsed) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient tokens to send this message.");
    }

    // Step 3: Create message
    const message = await Message.create([payload], { session });
    const result = message[0];
    if (!result) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to create message"
      );
    }

    // Step 4: Push message to conversation
    const conversation = await Conversation.findByIdAndUpdate(
      payload.chatId,
      { $push: { chat: result._id } },
      { session }
    );

    if (!conversation) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to update conversation"
      );
    }

    // Step 5: Deduct tokens from user
    const updatedUser = await User.findByIdAndUpdate(
      payload.userId,
      { $inc: { token: -tokenUsed } },
      { new: true, session }
    );

    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found while deducting token.");
    }

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};



// const addAMessage = async (payload: TMessage) => {

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     // 1. Create the message
//     const message = await Message.create([payload], { session });
//     const result = message[0];
//     if (!result) {
//       throw new ApiError(
//         httpStatus.INTERNAL_SERVER_ERROR,
//         "Failed to create message"
//       );
//     }

//     // 2. Push message to conversation
//     const conversation = await Conversation.findByIdAndUpdate(
//       payload.chatId,
//       { $push: { chat: result._id } },
//       { session }
//     );

//     if (!conversation) {
//       throw new ApiError(
//         httpStatus.INTERNAL_SERVER_ERROR,
//         "Failed to create conversation"
//       );
//     }

//     // 3. Fetch config
//     const configureData = await configureModel.findOne({}, null, { session });
//     if (!configureData) {
//       throw new ApiError(
//         httpStatus.NOT_FOUND,
//         "Configuration data not found"
//       );
//     }

//     // 4. Calculate token usage
//     const pricePerToken = configureData.dollerPerToken;
//     const tokenUsed = (payload.price / pricePerToken).toFixed(10);

//     // 5. Deduct token from user
//     const updatedUser = await User.findByIdAndUpdate(
//       payload.userId,
//       { $inc: { token: -tokenUsed } },
//       { new: true, session }
//     );

//     if (!updatedUser) {
//       throw new ApiError(httpStatus.NOT_FOUND, "User not found");
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return result;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

const getAllConversationsFromDB = async (id: string, query: any) => {

  const service_query = new QueryBuilder(Conversation.find({ userId: id }), query)
    .search(CONVERSATION_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await service_query.modelQuery.populate("userId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No conversations found");
  }
  const meta = await service_query.countTotal();
  return {
    result,
    meta,
  };







};
const getAllMessageFromDB = async (query: any) => {

  const service_query = new QueryBuilder(Message.find(), query)
    .search(MESSAGE_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await service_query.modelQuery.populate("userId").populate("chatId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No message found");
  }
  const meta = await service_query.countTotal();
  return {
    result,
    meta,
  };







};




const getMessagesFromConversationFromDB = async (conversationId: string) => {
  const conversation = await Conversation.findById(conversationId).populate({
    path: "chat",
    model: Message,
    populate: {
      path: "userId",
      select: "_id name email", // include relevant user fields
    },
  });
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  return conversation;
};

const getMessagesFromConversationInfiniteScrollFromDB = async (conversationId: string,
  page: number,
  limit: number) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  };

  const totalMessages = await Message.countDocuments({ chatId: conversationId });

  const messages = await Message.find({ chatId: conversationId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "userId",
      select: "_id name email"
    })

  const hasMore = (page * limit) < totalMessages;
  return {
    messages,
    total: totalMessages,
    hasMore,
    currentPage: page
  }
}

const deleteConversationFromDB = async (id: string) => {
  const existing = await Conversation.findById(id);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
  }
  await Conversation.findByIdAndDelete(id);
};

const changeConversationNameIntoDB = async (id: string, name: string) => {
  const existing = await Conversation.findByIdAndUpdate(id, { name });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
  }
  await Conversation.findOneAndDelete({ chatId: id });
};


export const conversationService = {
  createConversationIntoDB,
  addAMessage,
  getAllMessageFromDB,
  getAllConversationsFromDB,
  getMessagesFromConversationFromDB,
  getMessagesFromConversationInfiniteScrollFromDB,
  deleteConversationFromDB,
  changeConversationNameIntoDB,
};
