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

export const getBirthdaysFromMonth = async (month: number) => {
  return birthdayModel.aggregate([
    {$addFields: {'month': {$month: '$birthDate'}}},
    {$match: {month: month}},
  ]).sort({birthDate: 1});
};

export default birthdayModel;