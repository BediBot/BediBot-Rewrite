/**
 * Validates Environment Variables by ensuring they exist
 *
 * @return {boolean} Are environment variables valid?
 */
export const validateEnv = () => {
  if (!process.env.BOT_TOKEN) {
    console.warn('Missing Discord bot token.');
    return false;
  }

  if (!process.env.MONGO_URI) {
    console.warn('Missing MongoDB connection.');
    return false;
  }

  if (!process.env.BOT_OWNERS) {
    console.warn('Missing Bot Owner ID');
    return false;
  }
  return true;
};
