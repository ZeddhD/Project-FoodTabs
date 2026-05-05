// Standard response formatter
export const sendResponse = (res, status, success, message, data = null) => {
  res.status(status).json({
    success,
    message,
    ...(data && { data })
  });
};

// Error response handler
export const sendError = (res, status, message, errors = null) => {
  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

// Pagination helper
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  
  return { pageNum, limitNum, skip };
};
