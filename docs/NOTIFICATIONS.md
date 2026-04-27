# Notifications

Narrative Alpha Agent emits alerts through the `Notifier` port in `src/types/ports.ts`.

## Built-in Notifiers

- `ConsoleNotifier`: writes alerts to stdout
- `TelegramNotifierStub`: captures alert messages for future Telegram integration
- `DiscordNotifier`: sends rich embeds to a Discord webhook

## Discord

Set these variables in `.env`:

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_USERNAME=Narrative Alpha Agent
DISCORD_AVATAR_URL=
```

When `DISCORD_WEBHOOK_URL` is unset, Discord is not enabled. This keeps tests and replay offline by default.

Discord alerts include:

- narrative name
- alert reason
- NIP score
- lifecycle state
- document count
- timestamp

## Adding More Notifiers

Implement `Notifier`:

```ts
interface Notifier {
  notify(narrative: Narrative, message: string): Promise<void>;
}
```

Then inject it through `createRuntime({ notifiers: [...] })` or add a typed environment-backed config in `src/config/notifications.ts`.
