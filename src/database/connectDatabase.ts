import {connect} from 'mongoose';
import logger from '../utils/loggerUtil';

export const connectDatabase = async () => {
  await connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  logger.info('Connected to database!');
};