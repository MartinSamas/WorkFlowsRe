import { google } from 'googleapis';
import type { Request } from '../db/database';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_WORKSPACE_ADMIN_EMAIL = process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

export async function createHolidayEvent(request: Request): Promise<void> {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_WORKSPACE_ADMIN_EMAIL || !GOOGLE_CALENDAR_ID) {
    throw new Error(
      'Google Workspace Service Account credentials or Calendar ID are not fully configured in the environment variables.'
    );
  }

  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
    subject: GOOGLE_WORKSPACE_ADMIN_EMAIL,
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const startDateStr = new Date(request.start_date).toISOString().split('T')[0];

  const endDate = new Date(request.end_date);
  endDate.setDate(endDate.getDate() + 1);
  const endDateStr = endDate.toISOString().split('T')[0];

  const summary = `OOO / ${request.request_type}: ${request.user_name || request.user_email}`;
  const description = request.notes ? `Notes: ${request.notes}` : '';

  try {
    await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: {
        summary: summary,
        description: description,
        start: {
          date: startDateStr,
        },
        end: {
          date: endDateStr,
        },
      },
    });
    console.log(`Successfully created calendar event for request ${request.id}`);
  } catch (error) {
    console.error(`Failed to create calendar event for request ${request.id}:`, error);
    throw new Error(`Failed to create calendar event in Google Workspace`);
  }
}
