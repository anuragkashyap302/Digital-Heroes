import { getSupabaseClient, isMockDatabase } from '../config/db.js';

export class StorageService {
  /**
   * Uploads scorecard proof image buffer to private Supabase bucket 'scorecard-proofs'
   */
  static async uploadProof({ winnerId, userId, fileBuffer, fileName, mimeType }) {
    const supabase = getSupabaseClient();
    const filePath = `${userId}/${winnerId}_${Date.now()}_${fileName}`;

    if (supabase && !isMockDatabase()) {
      const bucketName = 'scorecards';
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (error) {
        // Fallback attempt with 'scorecard-proofs' if 'scorecards' wasn't matched
        const fallback = await supabase.storage.from('scorecard-proofs').upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });
        if (fallback.error) throw error;
      }
      return { path: filePath, storageProvider: 'supabase' };
    }

    // In-Memory / Base64 Data URL representation for local development
    const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    return { path: base64Data, storageProvider: 'mock-storage' };
  }

  /**
   * Generates a secure, temporary signed URL for viewing private proof images
   */
  static async getSignedUrl(filePath, expiresInSeconds = 3600) {
    if (!filePath) return null;
    
    // If it's already a full HTTP URL or data URI, return as-is
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
      return filePath;
    }

    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase()) {
      let { data, error } = await supabase.storage
        .from('scorecards')
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) {
        const fallback = await supabase.storage
          .from('scorecard-proofs')
          .createSignedUrl(filePath, expiresInSeconds);
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.warn('Could not generate signed URL:', error.message);
        return null;
      }
      return data?.signedUrl || null;
    }

    return filePath;
  }
}
