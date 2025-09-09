import { transporter, sender } from "../email/gmail.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  welcomeEmail
} from "../email/emailTemplates.js";
 
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
    html:welcomeEmail(name)
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