import {model, Schema} from 'mongoose';
import {hashString} from '../../utils/hashUtil';

interface PendingVerificationUserI {
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

const pendingVerificationUserModel = model<PendingVerificationUserI>('PendingVerificationUser', PendingVerificationUser, 'PendingVerificationUsers');

/**
 * Checks if a given email address is already linked to a pending verification user
 * @param {string} emailAddress
 * @returns {Promise<boolean>}
 */
export const emailAddressLinkedToPendingVerificationUser = async (emailAddress: string) => {
  const docs = await pendingVerificationUserModel.find();

  for (const doc of docs) {
    const emailHash = await hashString(emailAddress.substring(0, emailAddress.indexOf('@')));

    if (emailHash === doc.emailHash) return true;
  }
  return false;
};

/**
 * Adds a pending verification user to the database
 * @param {string} userId
 * @param {string} guildId
 * @param {string} emailHash
 * @param {string} uniqueKey
 * @returns {Promise<void>}
 */
export const addPendingVerificationUser = async (userId: string, guildId: string, emailHash: string, uniqueKey: string) => {
  await pendingVerificationUserModel.create({
    userId: userId,
    guildId: guildId,
    emailHash: emailHash,
    uniqueKey: uniqueKey,
  });
};

/**
 * Removes a pending verification user from the database
 * @param {string} userId
 * @param {string} guildId
 * @returns {Promise<void>}
 */
export const removePendingVerificationUser = async (userId: string, guildId: string) => {
  await pendingVerificationUserModel.deleteOne({
    userId: userId,
    guildId: guildId,
  });
};

/**
 * Checks if a given user (id) is pending verification
 * @param {string} userId
 * @param {string} guildId
 * @returns {Promise<boolean>}
 */
export const userPendingVerification = async (userId: string, guildId: string) => {
  return pendingVerificationUserModel.exists({
    userId: userId,
    guildId: guildId,
  });
};

/**
 * Checks if a unique key exists in the database and matches the given user id and guild id
 * @param userId
 * @param guildId
 * @param uniqueKey
 * @returns {Promise<boolean>}
 */
export const validUniqueKey = async (userId: string, guildId: string, uniqueKey: string) => {
  return pendingVerificationUserModel.exists({
    userId: userId,
    guildId: guildId,
    uniqueKey: uniqueKey,
  });
};

/**
 * Gets the hashed email of a pending verification user. Do not call this function unless you are certain the user exists in the DB.
 * @param userId
 * @param guildId
 * @returns {Promise<any>}
 */
export const emailHashFromPendingUser = async (userId: string, guildId: string) => {
  const doc = await pendingVerificationUserModel.findOne({
    userId: userId,
    guildId: guildId,
  });
  return doc!.emailHash;
};

export default pendingVerificationUserModel;