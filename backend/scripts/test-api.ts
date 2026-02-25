// Quick script to test creating requests via API
const BASE_URL = 'http://localhost:3000';

async function testCreateRequest() {
    const testRequest = {
        start_date: new Date('2026-08-01').toISOString(),
        end_date: new Date('2026-08-05').toISOString(),
        request_type: 'vacation',
        notes: 'Test request created via script',
        approvers: [
            {
                email: 'martin.samas@ui42.com',
                name: 'Test Manager',
                role: 'project_manager'
            },
            {
                email: 'hr@company.com',
                name: 'HR Department',
                role: 'hr'
            }
        ]
    };

    try {
        const response = await fetch(`${BASE_URL}/api/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testRequest)
        });

        const data = await response.json();
        console.log('Request created:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testCreateRequest();
