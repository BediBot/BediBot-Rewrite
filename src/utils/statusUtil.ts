import {PresenceData} from 'discord.js';

export const STATUSES = [
  {status: 'online', activities: [{type: 'LISTENING', name: 'Martingales | $help'}]},
  {status: 'online', activities: [{type: 'LISTENING', name: '115 ASMR | $help'}]},
  {status: 'online', activities: [{type: 'WATCHING', name: 'Geese honk | $help'}]},
  {status: 'online', activities: [{type: 'WATCHING', name: 'Crowdmark | $help'}]},
  {status: 'online', activities: [{type: 'STREAMING', name: 'EGAD Videos | $help'}]},
  {status: 'online', activities: [{type: 'PLAYING', name: 'Solidworks | $help'}]},
  {status: 'online', activities: [{type: 'PLAYING', name: 'Among Us | $help'}]},
];

/**
 * Gets a random status for the bot
 * @returns {PresenceData}
 */
export const getRandomStatus = () => {
  const random_int = Math.floor(Math.random() * STATUSES.length);
  const status_picked = STATUSES[random_int];
  return status_picked as PresenceData;
};
