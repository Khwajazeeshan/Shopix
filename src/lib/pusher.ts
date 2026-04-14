import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Handle CJS/ESM default import interop
const PServer = (PusherServer as any).default || PusherServer;
const PClient = (PusherClient as any).default || PusherClient;

export const pusherServer = new PServer({
  appId: process.env.app_id!,
  key: process.env.key!,
  secret: process.env.secret!,
  cluster: process.env.cluster!,
  useTLS: true,
});

// pusher-js (client) often exports the constructor as .Pusher or the default export itself
const PusherClientConstructor = (PClient as any).Pusher || PClient;

export const pusherClient = new PusherClientConstructor(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

