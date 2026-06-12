import axios from "axios"

export function getKanbanApiErrorMessage(
  cause: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(cause)) {
    const data = cause.response?.data as { message?: string } | undefined
    if (data?.message) {
      return data.message
    }
  }

  if (cause instanceof Error) {
    return cause.message
  }

  return fallback
}
