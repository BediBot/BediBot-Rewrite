import {model, Schema} from 'mongoose';

interface BirthdayI {
  _id: string, // User ID
  birthDate: Date;
}

export const Birthday = new Schema({
  _id: String,
  birthDate: Date,
});

const birthdayModel = model<BirthdayI>('Birthday', Birthday, 'Birthdays');

/**
 * Updates the user's birthday. If user is not found, upserts them into the DB.
 * @param userId
 * @param birthDate
 * @returns {Promise<void>}
 */
export const updateBirthday = async (userId: string, birthDate: Date) => {
  await birthdayModel.updateOne({_id: userId}, {birthDate: birthDate}, {upsert: true});
};

export default birthdayModel;