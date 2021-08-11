import {model, Schema} from 'mongoose';

export const Birthday = new Schema({
  _id: String,
  birthdate: Date,
});

export default model('Birthday', Birthday, 'Birthdays');