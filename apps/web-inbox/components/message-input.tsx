'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendMessage } from '@/app/actions';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
    conversationId: string;
    disabled?: boolean;
}

export function MessageInput({ conversationId, disabled }: MessageInputProps) {
    const [text, setText] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSend = async () => {
        if (!text.trim() || isPending) return;

        startTransition(async () => {
            try {
                await sendMessage(conversationId, text);
                setText('');
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 border-t bg-background/80 backdrop-blur-md sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex gap-3 max-w-4xl mx-auto items-center">
                <Input
                    placeholder="Tapez votre message ici..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={disabled || isPending}
                    className="flex-1 bg-muted/30 border-none ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary h-11 px-4 text-sm rounded-xl"
                />
                <Button
                    onClick={handleSend}
                    disabled={disabled || isPending || !text.trim()}
                    className="rounded-xl h-11 px-5 gap-2 transition-all duration-300 hover:shadow-lg"
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <span>Envoyer</span>
                            <Send className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
