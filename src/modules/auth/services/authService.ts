import { env } from "@/config/env"

export function validateAdminCode(code: string): boolean {
  return code.trim() === env.adminCode
}
