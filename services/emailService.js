const nodemailer = require('nodemailer');

async function sendMail({from, to , subject,text,html}) {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: `fileLinker <${from}>`,
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    });
}

module.exports = sendMail;