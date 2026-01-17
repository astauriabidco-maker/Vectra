'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserButton } from '@clerk/nextjs';
import {
    Settings,
    MessageSquare,
    Users,
    Plug,
    MessageCircle,
    Save,
    Loader2,
    Check,
    AlertCircle,
    Sparkles
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7070';

interface TwilioCredentials {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
}

interface Integration {
    id: string;
    provider: string;
    enabled: boolean;
    credentials: TwilioCredentials;
    updatedAt: string;
}

export default function IntegrationsPage() {
    const [integration, setIntegration] = useState<Integration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [accountSid, setAccountSid] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        loadIntegration();
    }, []);

    async function loadIntegration() {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/integrations/twilio`);
            if (response.ok) {
                const data = await response.json();
                setIntegration(data);
                setAccountSid(data.credentials?.accountSid || '');
                setPhoneNumber(data.credentials?.phoneNumber || '');
                setEnabled(data.enabled);
                // Note: authToken will be masked from API
            }
        } catch (err) {
            // Integration might not exist yet
            console.log('No existing Twilio integration');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave() {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${API_URL}/integrations/twilio`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled,
                    credentials: {
                        accountSid,
                        authToken: authToken || undefined, // Only send if changed
                        phoneNumber,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save integration');
            }

            const data = await response.json();
            setIntegration(data);
            setSuccess(true);
            setAuthToken(''); // Clear password field after save

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="flex h-screen bg-background font-sans antialiased text-foreground">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r bg-muted/30 flex flex-col">
                <div className="p-6 border-b bg-background/50 backdrop-blur-sm">
                    <span className="font-bold text-xl">Vectra</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard">
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                            <MessageSquare className="h-5 w-5" />
                            <span>Inbox</span>
                        </div>
                    </Link>
                    <Link href="/customers">
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                            <Users className="h-5 w-5" />
                            <span>Customers</span>
                        </div>
                    </Link>
                    <Link href="/settings/integrations">
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-accent text-foreground font-medium">
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                        </div>
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                        <span className="text-sm text-muted-foreground">Account</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b bg-background/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Plug className="h-6 w-6 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold">Integrations</h1>
                            <p className="text-sm text-muted-foreground">
                                Configure external services and APIs
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-2xl space-y-6">
                        {/* Twilio WhatsApp Card */}
                        <Card className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <MessageCircle className="h-6 w-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Twilio WhatsApp</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Send and receive WhatsApp messages
                                        </p>
                                    </div>
                                </div>
                                {integration?.enabled && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                                        <Check className="h-3 w-3" />
                                        Connected
                                    </span>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                                    <div>
                                        <label htmlFor="accountSid" className="block text-sm font-medium mb-1.5">
                                            Account SID
                                        </label>
                                        <Input
                                            id="accountSid"
                                            value={accountSid}
                                            onChange={(e) => setAccountSid(e.target.value)}
                                            placeholder="AC..."
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="authToken" className="block text-sm font-medium mb-1.5">
                                            Auth Token
                                            {integration && (
                                                <span className="text-muted-foreground text-xs ml-2">
                                                    (leave empty to keep current)
                                                </span>
                                            )}
                                        </label>
                                        <Input
                                            id="authToken"
                                            type="password"
                                            value={authToken}
                                            onChange={(e) => setAuthToken(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1.5">
                                            WhatsApp Phone Number
                                        </label>
                                        <Input
                                            id="phoneNumber"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="whatsapp:+1234567890"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <input
                                            type="checkbox"
                                            id="enabled"
                                            checked={enabled}
                                            onChange={(e) => setEnabled(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <label htmlFor="enabled" className="text-sm">
                                            Enable this integration
                                        </label>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 p-3 rounded-lg">
                                            <Check className="h-4 w-4" />
                                            Integration saved successfully!
                                        </div>
                                    )}

                                    <Button type="submit" disabled={isSaving} className="w-full gap-2">
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Configuration
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </Card>

                        {/* Google Gemini AI Card */}
                        <GoogleGeminiCard />

                        {/* Info Card */}
                        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Note:</strong> If no database configuration is set,
                                the system will fall back to environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Separate component for Google Gemini
function GoogleGeminiCard() {
    const [integration, setIntegration] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7070';

    useEffect(() => {
        loadIntegration();
    }, []);

    async function loadIntegration() {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/integrations/google`);
            if (response.ok) {
                const data = await response.json();
                setIntegration(data);
                setEnabled(data.enabled);
            }
        } catch (err) {
            console.log('No existing Google integration');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave() {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${API_URL}/integrations/google`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled,
                    credentials: {
                        apiKey: apiKey || undefined,
                    },
                }),
            });

            if (!response.ok) throw new Error('Failed to save');

            const data = await response.json();
            setIntegration(data);
            setSuccess(true);
            setApiKey('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Google Gemini AI</h3>
                        <p className="text-sm text-muted-foreground">
                            AI Copilot for reply suggestions
                        </p>
                    </div>
                </div>
                {integration?.enabled && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Connected
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div>
                        <label htmlFor="geminiApiKey" className="block text-sm font-medium mb-1.5">
                            Gemini API Key
                            {integration && (
                                <span className="text-muted-foreground text-xs ml-2">
                                    (leave empty to keep current)
                                </span>
                            )}
                        </label>
                        <Input
                            id="geminiApiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIza..."
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="geminiEnabled"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="geminiEnabled" className="text-sm">
                            Enable AI Copilot suggestions
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 text-sm text-purple-500 bg-purple-500/10 p-3 rounded-lg">
                            <Check className="h-4 w-4" />
                            AI integration saved!
                        </div>
                    )}

                    <Button type="submit" disabled={isSaving} className="w-full gap-2">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </form>
            )}
        </Card>
    );
}
