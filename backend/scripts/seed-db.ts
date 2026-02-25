import { db } from '../lib/db';

async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        const users = [
            {
                email: 'martin.samas@ui42.com',
                name: 'Martin Samas',
                picture: ''
            },
            {
                email: 'jane.smith@company.com',
                name: 'Jane Smith',
                picture: ''
            },
            {
                email: 'bob.johnson@company.com',
                name: 'Bob Johnson',
                picture: ''
            }
        ];

        // Sample approvers
        const approvers = [
            { email: 'manager1@company.com', name: 'Sarah Manager', role: 'project_manager' },
            { email: 'manager2@company.com', name: 'Tom Manager', role: 'project_manager' },
            { email: 'hr@company.com', name: 'HR Department', role: 'hr' },
            { email: 'ceo@company.com', name: 'CEO Boss', role: 'executive' },
            { email: 'martin.samas@ui42.com', name: 'tester', role: 'test' }
        ];

        // Create sample requests
        const requestsData = [
            {
                user: users[0],
                start_date: new Date('2026-03-15'),
                end_date: new Date('2026-03-20'),
                request_type: 'vacation',
                status: 'pending' as const,
                notes: 'Spring break vacation to visit family',
                approvers: [approvers[0], approvers[2]]
            },
            {
                user: users[0],
                start_date: new Date('2026-04-01'),
                end_date: new Date('2026-04-05'),
                request_type: 'vacation',
                status: 'approved' as const,
                notes: 'Easter holiday trip',
                approvers: [approvers[0], approvers[2]]
            },
            {
                user: users[0],
                start_date: new Date('2026-02-10'),
                end_date: new Date('2026-02-12'),
                request_type: 'sick_leave',
                status: 'denied' as const,
                notes: 'Not feeling well, need rest',
                approvers: [approvers[1]]
            },
            {
                user: users[1],
                start_date: new Date('2026-05-20'),
                end_date: new Date('2026-05-25'),
                request_type: 'vacation',
                status: 'pending' as const,
                notes: 'Summer vacation planning',
                approvers: [approvers[1], approvers[2], approvers[3]]
            },
            {
                user: users[2],
                start_date: new Date('2026-03-01'),
                end_date: new Date('2026-03-03'),
                request_type: 'personal',
                status: 'cancelled' as const,
                notes: 'Personal matters - cancelled due to project deadline',
                approvers: [approvers[0], approvers[4]]
            },
            {
                user: users[0],
                start_date: new Date('2026-06-15'),
                end_date: new Date('2026-06-30'),
                request_type: 'vacation',
                status: 'approved' as const,
                notes: 'Long summer vacation - 2 weeks in Italy',
                approvers: [approvers[0], approvers[2], approvers[3]]
            },
            {
                user: users[0],
                start_date: new Date('2026-07-10'),
                end_date: new Date('2026-07-12'),
                request_type: 'sick_leave',
                status: 'pending' as const,
                notes: 'Medical appointment scheduled',
                approvers: [approvers[0]]
            }
        ];

        console.log(`Creating ${requestsData.length} sample requests...`);

        for (const requestData of requestsData) {
            // Create request
            const request = await db.createRequest({
                user_email: requestData.user.email,
                user_name: requestData.user.name,
                user_picture: requestData.user.picture,
                request_time: new Date(),
                start_date: requestData.start_date,
                end_date: requestData.end_date,
                request_type: requestData.request_type,
                status: requestData.status,
                notes: requestData.notes,
                admin_notes: requestData.status === 'denied'
                    ? 'Insufficient coverage during this period'
                    : requestData.status === 'approved'
                        ? 'Approved - enjoy your time off!'
                        : undefined
            });

            console.log(`  Created request #${request.id}: ${requestData.user.name} - ${requestData.request_type} (${requestData.status})`);

            // Create approvals
            for (const approver of requestData.approvers) {
                let approvalStatus: 'pending' | 'approved' | 'denied' = 'pending';
                let respondedAt: Date | undefined = undefined;
                let decisionNotes: string | undefined = undefined;

                if (requestData.status === 'approved') {
                    approvalStatus = 'approved';
                    respondedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last week
                    decisionNotes = 'Approved. Have a great time!';
                } else if (requestData.status === 'denied') {
                    approvalStatus = 'denied';
                    respondedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
                    decisionNotes = 'Unfortunately we cannot approve this request at this time.';
                }

                await db.createApproval({
                    request_id: request.id,
                    approver_email: approver.email,
                    approver_name: approver.name,
                    approver_role: approver.role,
                    status: approvalStatus,
                    decision_notes: decisionNotes,
                    responded_at: respondedAt
                });
            }
        }

        console.log('\nDatabase seeded successfully!');
        console.log('\nSummary:');
        console.log(`   - ${requestsData.length} requests created`);
        console.log(`   - Multiple approvals per request`);
        console.log(`   - Mix of pending, approved, denied, and cancelled statuses`);
        console.log('\nYou can now test your UI with this data!');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
