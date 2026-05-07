const validateChat = (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    const error = new Error("Message is required and must be a non-empty string");
    error.status = 400;
    return next(error);
  }

  next();
};

export default validateChat;
