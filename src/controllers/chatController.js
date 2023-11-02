const chatController = {
  chatMessages: [],
  sendMessage: (req, res) => {
    const { message, sender } = req.body;

    if (!message || !sender) {
      return res
        .status(400)
        .json({ error: "Se requieren un mensaje válido" });
    }
    const newMessage = {
      message,
      sender,
      timestamp: new Date(),
    };
    chatController.chatMessages.push(newMessage);
    res.status(201).json(newMessage);
  },
  getChatMessages: (req, res) => {
    res.json(chatController.chatMessages);
  },
};

module.exports = chatController;