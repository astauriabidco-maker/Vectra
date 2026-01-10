
const { PrismaClient } = require('@prisma/client');

async function checkLeadingMessage() {
    const url = `postgresql://postgres:password@localhost:5454/vectra?schema=public`;
    console.log(`\n🔍 Checking DB for latest message...`);
    try {
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: url,
                },
            },
        });

        const recent = await prisma.message.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { conversation: { include: { contact: true } } }
        });

        if (recent.length === 0) console.log('   (No messages)');

        recent.forEach(m => {
            console.log(`   - [${m.senderType}] ${m.contentText} (${m.createdAt.toISOString()})`);
            console.log(`     Conv: ${m.conversation.id} | Contact: ${m.conversation.contact.attributes?.name || 'Unknown'}`);
        });

        await prisma.$disconnect();
    } catch (e) {
        console.log(`❌ Failed to connect: ${e.message}`);
    }
}

checkLeadingMessage();
