import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    console.log('Testing connection...');
    try {
        const count = await prisma.workspace.count();
        console.log(`Connection successful. Workspace count: ${count}`);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
