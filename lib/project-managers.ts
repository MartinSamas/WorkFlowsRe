export interface ProjectManager {
  email: string;
  name: string;
  role: string;
}

// Hardcoded list of project managers who can approve holiday requests.
// In the future, this will be configurable via a dashboard or synced from Google Workspace.
export const PROJECT_MANAGERS: ProjectManager[] = [
  { email: 'martin.samas@ui42.com', name: 'Martin Samaš', role: 'Tester' },
  { email: 'bob.smith@company.com', name: 'Bob Smith', role: 'Project Manager' },
  { email: 'carol.white@company.com', name: 'Carol White', role: 'Senior Project Manager' },
];
