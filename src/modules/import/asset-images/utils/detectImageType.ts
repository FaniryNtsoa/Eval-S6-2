export interface DetectedImageType {
  mimeType: string
  extension: string
  documenttypesId: number
}

const GLPI_DOCUMENT_TYPE_IDS = {
  jpeg: 1,
  png: 2,
  gif: 3,
} as const

export async function detectImageType(blob: Blob): Promise<DetectedImageType> {
  const header = new Uint8Array(await blob.slice(0, 12).arrayBuffer())

  if (header[0] === 0xff && header[1] === 0xd8) {
    return {
      mimeType: "image/jpeg",
      extension: ".jpg",
      documenttypesId: GLPI_DOCUMENT_TYPE_IDS.jpeg,
    }
  }

  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    return {
      mimeType: "image/png",
      extension: ".png",
      documenttypesId: GLPI_DOCUMENT_TYPE_IDS.png,
    }
  }

  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
    return {
      mimeType: "image/gif",
      extension: ".gif",
      documenttypesId: GLPI_DOCUMENT_TYPE_IDS.gif,
    }
  }

  throw new Error("Format d'image non supporté (JPEG, PNG ou GIF attendu)")
}

export function buildUploadFilename(
  assetName: string,
  extension: string,
): string {
  return `${assetName}${extension}`
}
