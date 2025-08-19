import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Email from '.';

const forgotPassword = async function (email, receiverName, url) {
  const forgotPasswordEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asset Management: Reset Password</title>
</head>
<body>
    <h3 style="color: #333333; font-family: Arial, sans-serif;">Greetings from Asset Management</h3>
    <p style="color: #333333; font-family: Arial, sans-serif;">Hi ${receiverName},</p>
    <p style="color: #333333; font-family: Arial, sans-serif;">We received a request to reset the password for the go4Shop account associated with this email address. To reset your password securely, please click the button below:</p>
    <div style="margin-top: 20px; margin-bottom: 20px;">
  <a href=${url} style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-family: Arial, sans-serif;">Reset Password</a>   
</div>
    <p style="color: #333333; font-family: Arial, sans-serif;">If clicking the button doesn't work, you can copy and paste the following link into your web browser's address bar:</p>
    <p style="color: #333333; font-family: Arial, sans-serif;">${url}</p>
    <p style="color: #333333; font-family: Arial, sans-serif;">If you did not request a password reset, please disregard this email. Rest assured, your Asset Management Account is safe.</p>
    <p style="color: #333333; font-family: Arial, sans-serif;">Thank you for using Asset Management.</p>
    <p style="color: #333333; font-family: Arial, sans-serif;">Regards,</p>
    <p style="color: #333333; font-family: Arial, sans-serif;">The Asset Management Support Team</p>
</body>
</html>
`;
  try {
    const mailOption = {
      from: `${process.env.FROM} <${process.env.EMAIL_FROM}`,
      to: email,
      subject: 'Reset Your Password',
      html: forgotPasswordEmail,
    };
    Email.sendMail(
      mailOption,
      function (err: Error, info: SMTPTransport.SentMessageInfo) {
        if (err) {
          throw err;
        } else {
          return info;
        }
      },
    );
  } catch (err) {
    throw err;
  }
};
export default forgotPassword;
