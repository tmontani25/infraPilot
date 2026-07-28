import { isAxiosError } from 'axios'

// Fastify renvoie { error, message, details } sur les erreurs. Sans ce helper,
// axios écrase tout ça avec un message générique du style
// "Request failed with status code 502".
export function getErrorMessage(err: unknown, fallback = 'Erreur API'): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message
    if (typeof message === 'string' && message.length > 0) return message
  }
  if (err instanceof Error) return err.message
  return fallback
}
