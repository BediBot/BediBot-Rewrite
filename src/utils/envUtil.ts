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
	console.warn('Missing Bot Owner IDs');
	return false;
  }

  if (!process.env.EMAIL_USER) {
	console.warn('Missing Email User');
	return false;
  }

  if (!process.env.EMAIL_CLIENT_ID) {
	console.warn('Missing Email Client ID');
	return false;
  }

  if (!process.env.EMAIL_CLIENT_SECRET) {
	console.warn('Missing Email Client Secret');
	return false;
  }

  if (!process.env.EMAIL_CLIENT_REFRESH) {
	console.warn('Missing Email Refresh Token');
	return false;
  }

  if (!process.env.LOG_LEVEL) {
	console.warn('Missing log level');
	return false;
  }
  return true;
};
