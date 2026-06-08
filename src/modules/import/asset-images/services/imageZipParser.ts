import JSZip from "jszip"

import type { ParsedAssetImage } from "@/modules/import/asset-images/types/asset-image.types"
import {
  buildUploadFilename,
  detectImageType,
} from "@/modules/import/asset-images/utils/detectImageType"

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])

function basename(path: string): string {
  const normalized = path.replace(/\\/g, "/")
  return normalized.split("/").pop() ?? normalized
}

function extensionOf(filename: string): string {
  const dotIndex = filename.lastIndexOf(".")

  if (dotIndex <= 0) {
    return ""
  }

  return filename.slice(dotIndex).toLowerCase()
}

function assetNameFromFilename(filename: string): string {
  const base = basename(filename)
  const dotIndex = base.lastIndexOf(".")

  if (dotIndex <= 0) {
    return base
  }

  return base.slice(0, dotIndex)
}

function isIgnoredZipPath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/")

  if (!normalized || normalized.endsWith("/")) {
    return true
  }

  if (normalized.includes("__MACOSX/") || basename(normalized).startsWith("._")) {
    return true
  }

  return false
}

function isImagePath(path: string): boolean {
  if (isIgnoredZipPath(path)) {
    return false
  }

  return IMAGE_EXTENSIONS.has(extensionOf(basename(path)))
}

export async function parseImageZip(content: ArrayBuffer): Promise<ParsedAssetImage[]> {
  const zip = await JSZip.loadAsync(content)
  const entries = Object.entries(zip.files).filter(([path, file]) => {
    return !file.dir && isImagePath(path)
  })

  const images: ParsedAssetImage[] = []

  for (let index = 0; index < entries.length; index += 1) {
    const [path, file] = entries[index]
    const filename = basename(path)
    const blob = await file.async("blob")
    const assetName = assetNameFromFilename(filename)
    const detected = await detectImageType(blob)

    images.push({
      rowIndex: index + 1,
      assetName,
      filename,
      uploadFilename: buildUploadFilename(assetName, detected.extension),
      blob,
      mimeType: detected.mimeType,
      documenttypesId: detected.documenttypesId,
    })
  }

  return images
}

export function parseImageZipFile(file: File): Promise<ParsedAssetImage[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      parseImageZip(reader.result as ArrayBuffer)
        .then(resolve)
        .catch(reject)
    }

    reader.onerror = () => {
      reject(new Error("Impossible de lire le fichier ZIP images"))
    }

    reader.readAsArrayBuffer(file)
  })
}
