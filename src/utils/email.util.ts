import nodemailer from "nodemailer";
import { IUser, ApplicationStatus } from "../types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendApplicationReceivedEmail = async (
  employer: IUser,
  candidateName: string,
  jobTitle: string,
  resumeUrl: string,
): Promise<void> => {
  if (!employer.emailNotifications.applicationReceived) return;

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@jobboard.com",
    to: employer.email,
    subject: `New Application for ${jobTitle}`,
    html: `
      <h2>New Application Received</h2>
      <p><strong>${candidateName}</strong> has applied to your job posting: <strong>${jobTitle}</strong></p>
      <p>View resume: <a href="${resumeUrl}">Download Resume</a></p>
      <p>Log in to your dashboard to review the application.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${employer.email}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

export const sendStatusUpdateEmail = async (
  candidate: IUser,
  jobTitle: string,
  newStatus: ApplicationStatus,
): Promise<void> => {
  if (!candidate.emailNotifications.statusChanged) return;

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@jobboard.com",
    to: candidate.email,
    subject: `Application Status Updated: ${jobTitle}`,
    html: `
      <h2>Application Status Update</h2>
      <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
      <p>New status: <strong>${newStatus}</strong></p>
      <p>Log in to your dashboard for more details.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${candidate.email}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};
