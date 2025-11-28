/**
 * Test script for GitHub webhook - Task Completion Testing
 * Simulates GitHub push events with task completions
 */

const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/github-webhook';
const WEBHOOK_SECRET = 'your-webhook-secret-here'; // Replace with your actual secret

// Test Case 1: Task completion via commit message
const taskCompletionPayload = {
    ref: 'refs/heads/web',
    commits: [
        {
            id: 'abc123def456',
            message: 'Task 1 Done - Implemented login page',
            added: ['team1/web/login.tsx'],
            modified: ['team1/web/app.tsx'],
            removed: [],
        },
    ],
};

// Test Case 2: Task completion via file pattern
const filePatternPayload = {
    ref: 'refs/heads/android',
    commits: [
        {
            id: 'xyz789',
            message: 'Added task solution',
            added: ['team-alpha/android/task2_solution.kt'],
            modified: [],
            removed: [],
        },
    ],
};

// Test Case 3: Multiple task completions
const multipleTasksPayload = {
    ref: 'refs/heads/core',
    commits: [
        {
            id: 'multi123',
            message: 'Completed Task 3 - Final implementation',
            added: ['team2/core/task3_final.py'],
            modified: ['team2/core/README.md'],
            removed: [],
        },
    ],
};

// Generate signature
function generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const signature = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
    return signature;
}

// Send webhook request
async function testWebhook(testName, payload) {
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Test: ${testName}`);
    console.log('='.repeat(60));
    console.log('Branch:', payload.ref);
    console.log('Commit Message:', payload.commits[0].message);
    console.log('Files:', [...payload.commits[0].added, ...payload.commits[0].modified]);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Hub-Signature-256': signature,
            },
            body: payloadString,
        });

        const data = await response.json();

        console.log('\n📊 Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Test passed!');
            if (data.results) {
                console.log('Task Completions:');
                data.results.forEach(r => {
                    console.log(`  - ${r.team}: Task ${r.task} in ${r.category} (${r.status})`);
                });
            }
        } else {
            console.log('\n❌ Test failed!');
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 Starting Webhook Task Completion Tests\n');

    await testWebhook('Task Completion via Commit Message', taskCompletionPayload);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests

    await testWebhook('Task Completion via File Pattern', filePatternPayload);
    await new Promise(resolve => setTimeout(resolve, 1000));

    await testWebhook('Multiple Task Completion', multipleTasksPayload);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed!');
    console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests();
