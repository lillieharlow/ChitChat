// errorhandler.js — Express error-handling middleware (four-argument signature).
// Catches any error passed via next(err) and returns a consistent JSON shape
// so the frontend always receives { error: { message, status } }.

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};

export default errorHandler;