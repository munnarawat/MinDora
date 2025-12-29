const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

async function creatChat(req,res) {

    const {title}= req.body;
    const user = req.user;
     
    const chat = await chatModel.create({
        user:user._id,
        title
    });

    res.status(201).json({
        message:"Chat created successfully ",
        chat:{
            id:chat._id,
            title:chat.title,
            lastActivity: chat.lastActivity,
            user:chat.user
        }
    })
}
async function getChat(req,res) {
    const user = req.user;
    const chats = await chatModel.find({ user: user._id });
    res.status(200).json({
        message: "Chat history retrieved successfully",
        chats:chats.map(chat=>({
            id:chat._id,
            title:chat.title,
            lastActivity: chat.lastActivity,
            user:chat.user
        }))
    });
}
async function getMessage(req,res) {
    const chatId = req.params.id;
    const messages = await messageModel.find({chat:chatId}).sort({createdAt:1});
    res.status(200).json({
        message:"message retrieved successfully",
        messages:messages
    })
}

async function createMessage(req, res) {
    try {
        const { message, timestamp } = req.body;
        const chatId = req.params.id;
        const user = req.user;

        // Verify chat belongs to user
        const chat = await chatModel.findOne({ _id: chatId, user: user._id });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Create user message
        const userMessage = await messageModel.create({
            chat: chatId,
            user: user._id,
            content: message,
            role: "user",
        });

        res.status(201).json({
            message: "Message created successfully",
            messageId: userMessage._id,
            userId: user._id
        });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    creatChat,
    getChat,
    getMessage,
    createMessage
}