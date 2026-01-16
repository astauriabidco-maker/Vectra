import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Page() {
    const { userId } = await auth();

    if (userId) {
        redirect("/dashboard");
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
            <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-2xl shadow-xl">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                        Vectra
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Votre boîte de réception intelligente et omnicanale.
                    </p>
                </div>

                <div className="pt-6 space-y-4">
                    <SignedOut>
                        <div className="flex flex-col gap-3">
                            <SignInButton mode="modal">
                                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl transition-all duration-200 shadow-md">
                                    Se connecter
                                </Button>
                            </SignInButton>
                            <p className="text-sm text-slate-400">
                                Accédez à vos conversations instantanément.
                            </p>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                                <UserButton afterSignOutUrl="/" />
                                <span className="text-sm font-medium text-slate-700">Session active</span>
                            </div>
                            <Link href="/dashboard" className="w-full">
                                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 rounded-xl transition-all duration-200 shadow-md">
                                    Aller au Dashboard
                                </Button>
                            </Link>
                        </div>
                    </SignedIn>
                </div>
            </div>

            <p className="mt-8 text-slate-400 text-sm italic">
                Propulsé par Google Gemini & Twilio
            </p>
        </div>
    );
}
