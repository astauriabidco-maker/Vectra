'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendMessage } from '@/app/lib/actions';
import { testAction } from '@/app/lib/test-action';
import { Send, Loader2, Sparkles, ArrowDown, X } from 'lucide-react';

interface ChatInputWithSuggestionProps {
    conversationId: string;
    suggestedReply?: string | null;
    disabled?: boolean;
}

export function ChatInputWithSuggestion({
    conversationId,
    suggestedReply,
    disabled
}: ChatInputWithSuggestionProps) {
    const [text, setText] = useState('');
    const [isPending, startTransition] = useTransition();
    const [showSuggestion, setShowSuggestion] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset suggestion visibility when suggestion changes
    useEffect(() => {
        if (suggestedReply) {
            setShowSuggestion(true);
        }
    }, [suggestedReply]);

    const handleSend = async () => {
        if (!text.trim() || isPending) return;

        startTransition(async () => {
            try {
                console.log('Invoking test action...');
                await testAction('test-string');
                await sendMessage(String(conversationId), String(text));
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

    const handleInsertSuggestion = () => {
        if (suggestedReply) {
            setText(suggestedReply);
            setShowSuggestion(false);
            // Focus the input after inserting
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const handleDismissSuggestion = () => {
        setShowSuggestion(false);
    };

    return (
        <div className="sticky bottom-0 z-10">
            {/* AI Suggestion Box */}
            {suggestedReply && showSuggestion && (
                <div className="mx-4 mb-2 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 shadow-lg">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                                    ✨ Suggestion IA
                                </span>
                                <button
                                    onClick={handleDismissSuggestion}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed mb-3">
                                {suggestedReply}
                            </p>
                            <Button
                                size="sm"
                                onClick={handleInsertSuggestion}
                                className="h-8 text-xs gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
                            >
                                <ArrowDown className="h-3 w-3" />
                                Insérer dans le message
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t bg-background/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <div className="flex gap-3 max-w-4xl mx-auto items-center">
                    <Input
                        ref={inputRef}
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
        </div>
    );
}
