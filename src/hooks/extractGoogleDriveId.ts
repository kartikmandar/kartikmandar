import type { CollectionBeforeChangeHook } from 'payload'

export const extractGoogleDriveId: CollectionBeforeChangeHook = ({ data }) => {
  // Only process if gDriveFolderUrl exists and gDriveFolderId is empty
  if (data?.materials?.gDriveFolderUrl && !data?.materials?.gDriveFolderId) {
    const url = data.materials.gDriveFolderUrl
    
    // Extract folder ID from various Google Drive URL formats
    const patterns = [
      /\/folders\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        // Update the gDriveFolderId in the data
        if (!data.materials) data.materials = {}
        data.materials.gDriveFolderId = match[1]
        break
      }
    }
  }
  
  return data
}