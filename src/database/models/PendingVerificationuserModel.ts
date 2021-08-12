import {model, Schema} from 'mongoose';

const bcrypt = require('bcrypt');

interface IPendingVerificationUser {
  userId: string,
  guildId: string,
  emailHash: string,
  uniqueKey: string
}

export const PendingVerificationUser = new Schema({
  userId: String,
  guildId: String,
  emailHash: String,
  uniqueKey: String,
});

const pendingVerificationUserModel = model<IPendingVerificationUser>('PendingVerificationUser', PendingVerificationUser, 'PendingVerificationUsers');

export const emailAddressLinkedToPendingVerificationUser = async (emailAddress: string) => {
  const docs = await pendingVerificationUserModel.find();

  for (const doc of docs) {
    if (bcrypt.compareSync(emailAddress, doc.emailHash)) return true;
  }
  return false;
};

export const addPendingVerificationUser = async (userId: string, guildId: string, emailHash: string, uniqueKey: string) => {
  await pendingVerificationUserModel.create({
    userId: userId,
    guildId: guildId,
    emailHash: emailHash,
    uniqueKey: uniqueKey,
  });
};

export const removePendingVerificationUser = async (userId: string, guildId: string) => {
  await pendingVerificationUserModel.deleteOne({
    userId: userId,
    guildId: guildId,
  });
};

export const userPendingVerification = async (userId: string, guildId: string) => {
  return pendingVerificationUserModel.exists({
    userId: userId,
    guildId: guildId,
  });
};

export const validUniqueKey = async (userId: string, guildId: string, uniqueKey: string) => {
  return pendingVerificationUserModel.exists({
    userId: userId,
    guildId: guildId,
    uniqueKey: uniqueKey,
  });
};

export const emailHashFromPendingUser = async (userId: string, guildId: string) => {
  const doc = await pendingVerificationUserModel.findOne({
    userId: userId,
    guildId: guildId,
  });
  return doc!.emailHash;
};

export default pendingVerificationUserModel;