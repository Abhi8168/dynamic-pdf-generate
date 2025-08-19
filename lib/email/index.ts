import { parseBoolean } from 'lib/common/utility.function';

const nodemailer = require('nodemailer');
require('dotenv').config();
// create reusable transporter object using the default SMTP transport

const host = parseInt(process.env.EMAIL_PORT || '587');
const secure = parseBoolean(process.env.EMAIL_SECURE || true);
let Email = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: host || 587,
  secure: secure || false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_FROM || '', // generated ethereal user
    pass: process.env.EMAIL_PASSWORD || '', // generated ethereal password
  },
});

export default Email;
