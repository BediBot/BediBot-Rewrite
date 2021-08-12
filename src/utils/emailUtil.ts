import logger from './loggerUtil';
import {SentMessageInfo} from 'nodemailer';

require('dotenv').config({path: '../.env'});

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_CLIENT_SECRET,
    refreshToken: process.env.EMAIL_CLIENT_REFRESH,
  },
});

const oAuth2Client = new OAuth2(process.env.EMAIL_CLIENT_ID, process.env.EMAIL_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
oAuth2Client.setCredentials({
  refresh_token: process.env.EMAIL_CLIENT_REFRESH,
});

const sendMail = (toAddress: string, subject: string, text: string, htmlText: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toAddress,
    subject: subject,
    text: text,
    html: htmlText,
    auth: {
      accessToken: oAuth2Client.getAccessToken(),
    },
  };

  transporter.sendMail(mailOptions, function(error: Error | null, info: SentMessageInfo) {
    if (error) {
      logger.error(error);
    } else {
      logger.info('Email sent: ' + info.response);
    }
  });
};

export const sendConfirmationEmail = (toAddress: string, userId: string, serverName: string, serverPrefix: string, uniqueKey: string) => {
  const text = `Please verify your email address by typing ${serverPrefix}confirm ${uniqueKey} in the ${serverName} server!`;

  const htmlText = `
<html>
  <head></head>
  <body>
    <p>
    HONK!
    <br/>
    Please verify your email address by typing ${serverPrefix}confirm ${uniqueKey} in the ${serverName} server!
    <br/>
    For any concerns, please contact a BediBot Dev :)
    <br/>
    </p>
  </body>
</html>
`;

  sendMail(toAddress, 'BediBot Verification', text, htmlText);
};

export const isEmailValid = (emailAddress: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(emailAddress);
};