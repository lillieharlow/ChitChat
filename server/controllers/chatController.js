// chatController.js — HTTP layer for the /chat endpoint.
// Extracts the validated request body, delegates to the Claude service,
// and writes the JSON response. All error handling is forwarded to the
// Express error middleware via next().

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
