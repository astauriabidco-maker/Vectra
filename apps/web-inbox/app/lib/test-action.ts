'use server';

export async function testAction(input: string) {
    console.log('Test Action Received:', input);
    return { success: true, received: input };
}
