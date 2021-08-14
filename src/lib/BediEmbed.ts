import {MessageEmbed} from 'discord.js';
import colors from '../utils/colorUtil';

export class BediEmbed extends MessageEmbed {
  public constructor() {
    super();
    this.setFooter('For any concerns, contact a BediBot dev: Aadi, Carson, Joe, Sahil, & Zayd');
    this.setTimestamp();
    this.setColor(colors.PRIMARY);
  }
}