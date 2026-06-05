const userRequests = new Map();

// Evict stale timestamps periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of userRequests.entries()) {
    const validTimestamps = timestamps.filter(t => now - t < 20000);
    if (validTimestamps.length === 0) {
      userRequests.delete(key);
    } else {
      userRequests.set(key, validTimestamps);
    }
  }
}, 30000); // runs every 30 seconds

export const submissionRateLimiter = (req, res, next) => {
  const userId = req.user ? req.user._id.toString() : req.ip;
  const now = Date.now();

  if (!userRequests.has(userId)) {
    userRequests.set(userId, []);
  }

  const timestamps = userRequests.get(userId);
  // Keep only requests from the last 20 seconds
  const activeTimestamps = timestamps.filter(t => now - t < 20000);

  if (activeTimestamps.length >= 5) {
    const oldestTimestamp = activeTimestamps[0];
    const waitTimeSec = Math.ceil((20000 - (now - oldestTimestamp)) / 1000);
    return res.status(429).json({
      message: `Too many compile submissions. Please wait ${waitTimeSec} seconds.`
    });
  }

  activeTimestamps.push(now);
  userRequests.set(userId, activeTimestamps);
  next();
};
