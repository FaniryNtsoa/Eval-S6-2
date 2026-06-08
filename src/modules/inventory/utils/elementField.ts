import { resolveRefField } from "@/modules/assistance/utils/glpiField"
import type { GlpiRefField } from "@/modules/assistance/types/ticket.types"

export function resolveElementRef(
  value: GlpiRefField | number | undefined | null,
): string {
  return resolveRefField(value).label
}

export function resolveElementRefName(
  value: GlpiRefField | number | undefined | null,
): string {
  const resolved = resolveRefField(value)
  return resolved.label === "—" ? "" : resolved.label
}
