export type NotificationConfig = {
  discordWebhookUrl?: string | undefined;
  discordUsername?: string | undefined;
  discordAvatarUrl?: string | undefined;
};

export const readNotificationConfigFromEnv = (
  env: NodeJS.ProcessEnv = process.env
): NotificationConfig => ({
  discordWebhookUrl: env.DISCORD_WEBHOOK_URL,
  discordUsername: env.DISCORD_USERNAME ?? "Narrative Alpha Agent",
  discordAvatarUrl: env.DISCORD_AVATAR_URL
});
