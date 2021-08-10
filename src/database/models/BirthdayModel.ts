import {model, Schema} from 'mongoose';

export const Birthday = new Schema({
  userID: Number,
  birthdate: Date,
});

export default model('birthday', Birthday);