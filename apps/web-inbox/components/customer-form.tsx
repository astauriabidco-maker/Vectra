'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createCustomer, CreateCustomerData } from '@/lib/api';
import { X, Loader2, MessageCircle } from 'lucide-react';

interface CustomerFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function CustomerForm({ onSuccess, onCancel }: CustomerFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const emailValue = formData.get('email') as string;
        const data: CreateCustomerData = {
            phone: formData.get('phone') as string,  // Required now
            email: emailValue || undefined,  // Optional
            name: formData.get('name') as string || undefined,
            company: formData.get('company') as string || undefined,
        };

        try {
            await createCustomer(data);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create customer');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 border">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">New Customer</h2>
                    <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Phone First Notice */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-3">
                        <MessageCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-emerald-600">Phone-First CRM</p>
                            <p className="text-muted-foreground">WhatsApp contacts are auto-created from conversations.</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            placeholder="+33 6 12 34 56 78"
                            className="border-emerald-500/50 focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                            Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                            Email <span className="text-muted-foreground text-xs">(optional)</span>
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="customer@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="company" className="block text-sm font-medium mb-1.5">
                            Company
                        </label>
                        <Input
                            id="company"
                            name="company"
                            placeholder="Acme Inc."
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Customer'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
