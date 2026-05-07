import { getChatReply } from "../services/claudeService.js";

const chatController = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const reply = await getChatReply(message, history);
    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

export default chatController;
