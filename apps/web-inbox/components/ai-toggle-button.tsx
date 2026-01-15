'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toggleAiStatus } from '@/app/lib/actions';
import { Bot, BotOff, Loader2 } from 'lucide-react';

interface AiToggleButtonProps {
    conversationId: string;
    initialStatus: string;
}

export function AiToggleButton({ conversationId, initialStatus }: AiToggleButtonProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        const nextStatus = status === 'ON' ? 'PAUSED' : 'ON';
        startTransition(async () => {
            try {
                await toggleAiStatus(String(conversationId), String(nextStatus));
                setStatus(nextStatus);
            } catch (error) {
                console.error('Failed to toggle AI status:', error);
            }
        });
    };

    const isOn = status === 'ON';

    return (
        <Button
            variant={isOn ? 'default' : 'destructive'}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className={`gap-2 transition-all duration-300 ${isOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-500 hover:bg-slate-600'}`}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isOn ? (
                <Bot className="h-4 w-4" />
            ) : (
                <BotOff className="h-4 w-4" />
            )}
            AI Assistant: {isOn ? 'ON' : 'PAUSED'}
        </Button>
    );
}
