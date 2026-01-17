'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, X } from 'lucide-react';

interface AiSuggestionProps {
    suggestion: string;
    onUse: (text: string) => void;
    onDismiss: () => void;
}

export function AiSuggestion({ suggestion, onUse, onDismiss }: AiSuggestionProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible || !suggestion) return null;

    const handleUse = () => {
        onUse(suggestion);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        onDismiss();
        setIsVisible(false);
    };

    return (
        <div className="mx-4 mb-2 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-purple-500">✨ AI Suggestion</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                        {suggestion}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <Button
                            size="sm"
                            onClick={handleUse}
                            className="h-7 text-xs gap-1 bg-purple-500 hover:bg-purple-600"
                        >
                            <Check className="h-3 w-3" />
                            Use this
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                            Dismiss
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
