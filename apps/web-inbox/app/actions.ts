'use server';

import { PrismaClient } from 'database';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function toggleAiStatus(conversationId: string, newStatus: string) {
    if (!['ON', 'PAUSED'].includes(newStatus)) {
        throw new Error('Invalid AI status');
    }

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { aiStatus: newStatus },
    });

    revalidatePath('/dashboard');
    return { success: true };
}

export async function sendMessage(conversationId: string, text: string) {
    const response = await fetch('http://localhost:7070/messages/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId, text }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    revalidatePath('/dashboard');
    return await response.json();
}
