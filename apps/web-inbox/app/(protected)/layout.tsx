import { AppSidebar } from '@/components/app-sidebar';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background">
            <AppSidebar />
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
