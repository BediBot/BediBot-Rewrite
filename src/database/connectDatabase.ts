import {connect} from 'mongoose';

export const connectDatabase = async () => {
  await connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  console.log('Connected to database!');
};