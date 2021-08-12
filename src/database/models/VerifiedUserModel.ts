import {model, Schema} from 'mongoose';
import {getSettings} from './SettingsModel';

const bcrypt = require('bcrypt');

interface IVerifiedUser {
  userId: string,
  guildId: string,
  emailHash: string,
  birthdate: Date;
}

export const VerifiedUser = new Schema({
  userId: String,
  guildId: String,
  emailHash: String,
  birthdate: Date,
});

const verifiedUserModel = model<IVerifiedUser>('VerifiedUser', VerifiedUser, 'VerifiedUsers');

export const userVerifiedInGuild = async (userId: string, guildId: string) => {
  return verifiedUserModel.exists({
    userId: userId,
    guildId: guildId,
  });
};

export const userVerifiedAnywhereEmailHash = async (userId: string, guildId: string) => {
  const docs = await verifiedUserModel.find({userId: userId});
  for (const doc of docs) {
    const origSettingsData = await getSettings(guildId);
    const otherSettingsData = await getSettings(guildId);

    if (origSettingsData.prefix === otherSettingsData.prefix) {
      return doc.emailHash;
    }
  }
  return null;
};

export const addVerifiedUser = async (userId: string, guildId: string, emailHash: string) => {
  await verifiedUserModel.create({
    userId: userId,
    guildId: guildId,
    emailHash: emailHash,
  });
};

export const removeVerifiedUser = async (userId: string, guildId: string) => {
  await verifiedUserModel.deleteOne({
    userId: userId,
    guildId: guildId,
  });
};

export const emailAddressLinkedToUser = async (emailAddress: string) => {
  const docs = await verifiedUserModel.find();

  for (const doc of docs) {
    if (bcrypt.compareSync(emailAddress, doc.emailHash)) return true;
  }
  return false;
};

export default verifiedUserModel;