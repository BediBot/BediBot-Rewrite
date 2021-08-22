import {model, Schema} from 'mongoose';
import {reqDate, reqString} from '../../utils/databaseUtil';

interface BirthdayI {
  _id: string, // User ID
  birthDate: Date;
}

export const Birthday = new Schema({
  _id: reqString,
  birthDate: reqDate,
}, {versionKey: false});

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

/**
 * Gets the birthdays for a given month number
 * @param month
 * @returns {Promise<Aggregate<Array<any>>>}
 */
export const getBirthdaysFromMonth = async (month: number) => {
  return birthdayModel.aggregate([
    {$addFields: {'month': {$month: '$birthDate'}}},
    {$match: {month: month}},
  ]).sort({birthDate: 1});
};

/**
 * Gets the birthdays for today in a given timezone
 * @param timezone
 * @returns {Promise<Aggregate<Array<any>>>}
 */
export const getBirthdaysToday = async (timezone: string) => {
  const month = parseInt(new Date().toLocaleString('en-US', {month: 'numeric', timeZone: timezone}));
  const day = parseInt(new Date().toLocaleString('en-US', {day: 'numeric', timeZone: timezone}));

  return birthdayModel.aggregate([
    {
      $addFields: {
        'month': {$month: '$birthDate'},
        'day': {$dayOfMonth: '$birthDate'},
      },
    },
    {$match: {month: month}},
    {$match: {day: day}},
  ]);
};

export default birthdayModel;