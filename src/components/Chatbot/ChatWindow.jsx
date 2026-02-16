import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatWindow = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI shopping assistant. How can I help you find the perfect product today?", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Send to n8n Webhook
        try {
            const response = await fetch('https://unstrengthened-lyn-euphemistic.ngrok-free.dev/webhook-test/zoomstorechatn8nahmad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                'ngrok-skip-browser-warning': 'true',
                body: JSON.stringify({ message: inputText, sender: 'user' })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            // Assuming n8n returns { output: "text" } or { text: "text" } or similar.
            // Adjust based on your n8n workflow output structure.
            const aiText = data.output || data.text || data.message || "I'm not sure how to respond to that.";

            const aiMessage = { id: Date.now() + 1, text: aiText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to the server.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] z-50 origin-bottom-right"
                >
                    <Card className="flex flex-col h-[500px] shadow-2xl border-border/50 backdrop-blur-xl bg-background/80">
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-primary/5 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Smart Assistant</h3>
                                    <p className="text-xs text-muted-foreground">Always online</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full",
                                        msg.sender === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "flex max-w-[80%] items-end gap-2",
                                        msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                            msg.sender === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}>
                                            {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                        </div>
                                        <div className={cn(
                                            "p-3 text-sm rounded-2xl shadow-sm overflow-hidden",
                                            msg.sender === 'user'
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-muted text-foreground rounded-bl-none"
                                        )}>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({ node, ...props }) => <a {...props} className="text-blue-400 underline break-all" target="_blank" rel="noopener noreferrer" />,
                                                    ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside ml-2" />,
                                                    img: ({ node, ...props }) => (
                                                        <img {...props} className="max-w-full h-auto rounded-lg mt-2 border border-gray-600" style={{ maxHeight: '150px' }} />
                                                    ),
                                                    strong: ({ node, ...props }) => <span {...props} className="font-bold text-purple-400" />
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex w-full justify-start">
                                    <div className="flex max-w-[80%] items-end gap-2 flex-row">
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <Bot className="w-3 h-3" />
                                        </div>
                                        <div className="bg-muted p-3 rounded-2xl rounded-bl-none">
                                            <div className="flex gap-1">
                                                <motion.div
                                                    className="w-1.5 h-1.5 bg-foreground/40 rounded-full"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                />
                                                <motion.div
                                                    className="w-1.5 h-1.5 bg-foreground/40 rounded-full"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                />
                                                <motion.div
                                                    className="w-1.5 h-1.5 bg-foreground/40 rounded-full"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t bg-background/50 rounded-b-2xl">
                            <div className="flex gap-2">
                                <Input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="rounded-full bg-muted/50 border-0 focus-visible:ring-1"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="rounded-full w-11 h-11 shrink-0 bg-primary hover:bg-primary/90 transition-all shadow-md active:scale-95"
                                    disabled={!inputText.trim()}
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatWindow;
