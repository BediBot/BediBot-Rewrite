export const validateEnv = () => {
  if (!process.env.BOT_TOKEN) {
    console.warn('Missing Discord bot token.');
    return false;
  }

  if (!process.env.MONGO_URI) {
    console.warn('Missing MongoDB connection.');
    return false;
  }
  return true;
};
