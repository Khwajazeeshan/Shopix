import Pusher from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new Pusher({
  appId: process.env.app_id!,
  key: process.env.key!,
  secret: process.env.secret!,
  cluster: process.env.cluster!,
  useTLS: true,
});

export const pusherClient = typeof window !== "undefined" 
  ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  : null;
