import Ably from "ably";
import { envConfig } from "@/config/env-config";

export const ablyRest = new Ably.Rest(envConfig.ably_api_key);

export const publishToUser = async (userId: string, event: string, data: unknown) => {
  const channel = ablyRest.channels.get(`user:${userId}`);
  await channel.publish(event, data);
};

export const publishToAdmins = async (event: string, data: unknown) => {
  const channel = ablyRest.channels.get("admin_room");
  await channel.publish(event, data);
};
