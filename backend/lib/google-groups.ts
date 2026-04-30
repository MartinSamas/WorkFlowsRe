import { google } from 'googleapis';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
const GOOGLE_WORKSPACE_ADMIN_EMAIL = process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL;

export async function getGoogleGroupMembers(groupEmail: string): Promise<string[]> {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_WORKSPACE_ADMIN_EMAIL) {
    throw new Error(
      'Google Workspace Service Account credentials are not fully configured in the environment variables (need EMAIL, PRIVATE_KEY, and ADMIN_EMAIL).'
    );
  }

  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/admin.directory.group.readonly'],
    subject: GOOGLE_WORKSPACE_ADMIN_EMAIL,
  });

  const admin = google.admin({ version: 'directory_v1', auth });

  try {
    const response = await admin.members.list({
      groupKey: groupEmail,
    });

    const members = response.data.members || [];

    // Filter only user members (ignoring nested groups for simplicity, though could be resolved recursively if needed)
    return members
      .filter((member) => member.email && member.type === 'USER')
      .map((member) => member.email!);
  } catch (error) {
    console.error(`Failed to fetch members for group ${groupEmail}:`, error);
    throw new Error(`Failed to fetch members from Google Workspace for ${groupEmail}`);
  }
}
