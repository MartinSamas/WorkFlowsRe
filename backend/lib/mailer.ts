import nodemailer from 'nodemailer';
import type { Request } from '../db/database';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || 'localhost',
  port: parseInt(SMTP_PORT || '1025', 10),
  secure: parseInt(SMTP_PORT || '1025', 10) === 465,
  auth: SMTP_USER ? {
    user: SMTP_USER,
    pass: SMTP_PASS,
  } : undefined,
});

const fromAddress = SMTP_FROM || 'noreply@ui42.sk';

export async function sendNewRequestNotification(request: Request, approvers: string[]): Promise<void> {
  if (!approvers.length) return;
  const subject = `New Request Pending Approval: ${request.request_type}`;
  const text = `A new ${request.request_type} request by ${request.user_email} requires your approval.
Dates: ${new Date(request.start_date).toDateString()} to ${new Date(request.end_date).toDateString()}
Notes: ${request.notes || 'None'}`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: approvers.join(', '),
      subject,
      text,
    });
    console.log(`Sent new request notification to ${approvers.length} approver(s)`);
  } catch (error) {
    console.error('Failed to send new request notification email', error);
  }
}

export async function sendRequestResultNotification(request: Request): Promise<void> {
  const subject = `Request ${request.status.toUpperCase()}: ${request.request_type}`;
  const text = `Your ${request.request_type} request for dates ${new Date(request.start_date).toDateString()} to ${new Date(request.end_date).toDateString()} has been ${request.status}.`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: request.user_email,
      subject,
      text,
    });
    console.log(`Sent request result notification to ${request.user_email}`);
  } catch (error) {
    console.error('Failed to send request result notification email', error);
  }
}
