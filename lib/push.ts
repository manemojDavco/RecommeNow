// Sends Expo push notifications to mobile app users.
// Uses the Expo Push API (no extra SDK needed — plain fetch).
// Docs: https://docs.expo.dev/push-notifications/sending-notifications/

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

type PushMessage = {
  to: string          // Expo push token
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
}

export async function sendPushNotification(msg: PushMessage): Promise<void> {
  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      to: msg.to,
      title: msg.title,
      body: msg.body,
      data: msg.data ?? {},
      sound: msg.sound ?? 'default',
      badge: msg.badge,
    }),
  }).catch(console.error) // fire-and-forget
}

export async function sendNewVouchNotification(pushToken: string, giverName: string): Promise<void> {
  await sendPushNotification({
    to: pushToken,
    title: '🎉 New vouch received!',
    body: `${giverName} just vouched for you. Tap to review it.`,
    data: { screen: 'vouches', tab: 'pending' },
  })
}
