import Pusher from 'pusher-js';

// Prevent multiple instances
let pusherClientInstance: Pusher | null = null;

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null;
  
  if (!pusherClientInstance) {
    pusherClientInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock-key', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    });
  }
  
  return pusherClientInstance;
};
