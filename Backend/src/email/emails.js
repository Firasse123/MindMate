import { transporter, sender } from "./gmail.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const mailOptions = {
    from: sender.email,
    to: email,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: sender.email,
    to: email,
    subject: "Welcome to Our App!",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome ${name}! 🎉</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <p>Hello ${name},</p>
          <p>Welcome to our platform! We're excited to have you on board.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #4CAF50; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; display: inline-block; font-size: 30px;">
              🚀
            </div>
          </div>
          <p>Your email has been successfully verified, and you're all set to start exploring!</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>Your App Team</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", result.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const mailOptions = {
    from: sender.email,
    to: email,
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", result.messageId);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const mailOptions = {
    from: sender.email,
    to: email,
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset success email sent:", result.messageId);
  } catch (error) {
    console.error("Error sending password reset success email:", error);
  }
};