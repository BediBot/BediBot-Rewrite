import {PresenceData} from 'discord.js';

const statuses = [
  {status: 'online', activities: [{type: 'LISTENING', name: 'Martingales | $help'}]},
  {status: 'online', activities: [{type: 'LISTENING', name: '115 ASMR | $help'}]},
  {status: 'online', activities: [{type: 'WATCHING', name: 'Geese honk | $help'}]},
  {status: 'online', activities: [{type: 'WATCHING', name: 'Crowdmark | $help'}]},
  {status: 'online', activities: [{type: 'STREAMING', name: 'EGAD Videos | $help'}]},
  {status: 'online', activities: [{type: 'PLAYING', name: 'Solidworks | $help'}]},
  {status: 'online', activities: [{type: 'PLAYING', name: 'Among Us | $help'}]},
];

export const getRandomStatus = () => {
  const random_int = Math.floor(Math.random() * statuses.length);
  const status_picked = statuses[random_int];
  return status_picked as PresenceData;
};