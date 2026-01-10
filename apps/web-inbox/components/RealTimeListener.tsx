'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function RealTimeListener() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (socketRef.current) return;

        console.log('🔄 [Socket] Initializing auto-refresh listener...');

        const socket = io('http://localhost:7070', {
            transports: ['websocket'],
            reconnection: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 [Socket] Connected!');
        });

        socket.on('message_received', (data) => {
            console.log('📩 [Socket] Received Update, refreshing UI...');

            // Hard reload after a short delay to ensure DB propagation
            setTimeout(() => {
                window.location.reload();
            }, 300);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    return null;
}
