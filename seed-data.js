/**
 * Seed script to populate the database with sample data
 * Run with: node seed-data.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // Create teams
    const teams = [
        { name: 'team1', avatar: generateAvatar('team1') },
        { name: 'team2', avatar: generateAvatar('team2') },
        { name: 'team3', avatar: generateAvatar('team3') },
    ];

    for (const teamData of teams) {
        const team = await prisma.team.upsert({
            where: { name: teamData.name },
            update: {},
            create: teamData,
        });

        console.log(`✅ Created team: ${team.name}`);

        // Create categories for each team
        const categories = ['Global', 'Web', 'Android', 'Core'];

        for (const categoryName of categories) {
            const score = Math.floor(Math.random() * 500);
            const commits = Math.floor(score / 15);

            await prisma.category.upsert({
                where: {
                    teamId_name: {
                        teamId: team.id,
                        name: categoryName,
                    },
                },
                update: {
                    commitCount: commits,
                    totalScore: score,
                    lastActive: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
                },
                create: {
                    teamId: team.id,
                    name: categoryName,
                    commitCount: commits,
                    totalScore: score,
                    lastActive: new Date(Date.now() - Math.random() * 86400000),
                },
            });
        }

        // Create some activity logs
        const messages = [
            'Fixed critical bug',
            'Added new feature',
            'Updated documentation',
            'Refactored code',
            'Improved performance',
        ];

        for (let i = 0; i < 5; i++) {
            await prisma.activityLog.create({
                data: {
                    teamId: team.id,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    message: messages[Math.floor(Math.random() * messages.length)],
                    points: Math.floor(Math.random() * 50) + 10,
                    timestamp: new Date(Date.now() - Math.random() * 86400000),
                },
            });
        }
    }

    console.log('\n✨ Seeding complete!');
}

function generateAvatar(teamName) {
    const initials = teamName.slice(0, 2).toUpperCase();
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
        hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);

    const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue}, 70%, 50%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360}, 70%, 60%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad${hash})" />
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="central">
        ${initials}
      </text>
    </svg>
  `.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
