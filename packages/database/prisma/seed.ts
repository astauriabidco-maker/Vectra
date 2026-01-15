import { PrismaClient, IdentityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Create Organization
    const organization = await prisma.organization.create({
        data: {
            name: 'Vectra Demo Corp',
        },
    });
    console.log(`✅ Created Organization: ${organization.name}`);

    // 2. Create Contact (Client)
    const contact = await prisma.contact.create({
        data: {
            organizationId: organization.id,
            attributes: {
                name: 'Alice Dupuis',
                email: 'alice@example.com',
                phone: '+33612345678',
            },
            identities: {
                create: [
                    {
                        type: IdentityType.EMAIL,
                        identifier: 'alice@example.com',
                        isPrimary: true,
                    },
                    {
                        type: IdentityType.WHATSAPP,
                        identifier: '+33612345678',
                    },
                ],
            },
        },
    });
    console.log(`✅ Created Contact: Alice Dupuis`);

    // 3. Create Conversation
    const conversation = await prisma.conversation.create({
        data: {
            contactId: contact.id,
            status: 'OPEN',
            aiStatus: 'ON',
            messages: {
                create: [
                    {
                        senderType: 'USER',
                        contentText: 'Bonjour, je voudrais des infos sur vos tarifs.',
                        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                    },
                    {
                        senderType: 'BOT',
                        contentText: 'Bonjour Alice ! Je suis l\'assistant virtuel. Nos tarifs dépendent de vos besoins. Êtes-vous une entreprise ?',
                        createdAt: new Date(Date.now() - 1000 * 60 * 59),
                    },
                    {
                        senderType: 'USER',
                        contentText: 'Oui, une PME.',
                        createdAt: new Date(Date.now() - 1000 * 60 * 30),
                    },
                ],
            },
        },
    });
    console.log(`✅ Created Conversation with messages: ${conversation.id}`);

    // 4. Create another Contact & Conversation
    const contact2 = await prisma.contact.create({
        data: {
            organizationId: organization.id,
            attributes: {
                name: 'Bob Martin',
            },
        },
    });

    await prisma.conversation.create({
        data: {
            contactId: contact2.id,
            status: 'CLOSED',
            messages: {
                create: [
                    {
                        senderType: 'USER',
                        contentText: 'Mon problème est résolu, merci.',
                    },
                    {
                        senderType: 'AGENT',
                        contentText: 'Parfait, bonne journée !',
                    },
                ],
            },
        },
    });
    console.log(`✅ Created Closed Conversation for Bob`);

    console.log('🏁 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
