import { legacyCreate, legacyUploadDocument } from "@/services/api/legacyClient"

export async function uploadAndLinkAssetImage(
  file: Blob,
  uploadFilename: string,
  documenttypesId: number,
  itemType: string,
  assetId: number,
): Promise<number> {
  const document = await legacyUploadDocument(file, uploadFilename, {
    documenttypesId,
  })

  await legacyCreate("Document_Item", {
    documents_id: document.id,
    items_id: assetId,
    itemtype: itemType,
    add: "Add",
  })

  return document.id
}
