import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';

const ChatButton = ({ isOpen, onClick }) => {
    return (
        <motion.div
            className="fixed bottom-6 right-6 z-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Button
                size="icon"
                onClick={onClick}
                className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 ${isOpen
                        ? 'bg-muted text-foreground hover:bg-muted/80 rotate-90 opacity-0 pointer-events-none absolute'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
            >
                <MessageCircle className="h-7 w-7" />
            </Button>
        </motion.div>
    );
};

export default ChatButton;
