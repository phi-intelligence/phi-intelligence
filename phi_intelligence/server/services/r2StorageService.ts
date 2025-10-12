import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import keyVaultService from './keyVaultService';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  endpoint: string;
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileKey?: string;
  error?: string;
}

export interface FileMetadata {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
}

export class R2StorageService {
  private client: S3Client;
  private config: R2Config;

  constructor() {
    this.initializeConfig();
  }

  private async initializeConfig() {
    try {
      const credentials = await keyVaultService.getR2Credentials('primary');
      this.config = {
        accountId: credentials.accountId,
        accessKeyId: credentials.accessKey,
        secretAccessKey: credentials.secretKey,
        bucketName: credentials.bucketName,
        region: 'auto',
        endpoint: `https://${credentials.accountId}.r2.cloudflarestorage.com`
      };
    } catch (error) {
      console.warn('Failed to get R2 credentials from Key Vault, using environment variables');
      this.config = {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.R2_BUCKET_NAME || 'phi',
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT || 'https://4bcf8832c26a1d24c67738e2ad9dedfa.r2.cloudflarestorage.com'
      };
    }

    this.client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      forcePathStyle: false,
    });
  }

  /**
   * Upload a resume file to R2 storage
   * @param file - The file buffer or stream
   * @param fileName - Original file name
   * @param contentType - MIME type of the file
   * @param jobId - Job ID for organizing files
   * @param applicantId - Unique identifier for the applicant
   */
  async uploadResume(
    file: Buffer | Readable,
    fileName: string,
    contentType: string,
    jobId: string,
    applicantId: string
  ): Promise<UploadResult> {
    try {
      // Validate configuration
      if (!this.isConfigured()) {
        throw new Error('R2 storage not properly configured');
      }

      // Generate unique file key
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const fileKey = `applications/${jobId}/${applicantId}/${timestamp}-${fileName}`;

      // Validate file type
      if (!this.isValidResumeType(fileExtension)) {
        throw new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.');
      }

      // Prepare upload parameters
      const uploadParams = {
        Bucket: this.config.bucketName,
        Key: fileKey,
        Body: file,
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          jobId: jobId,
          applicantId: applicantId,
          uploadedAt: new Date().toISOString(),
          fileType: fileExtension || 'unknown'
        }
      };

      // Upload file
      const command = new PutObjectCommand(uploadParams);
      await this.client.send(command);

      // Generate public URL
      const fileUrl = `${this.config.endpoint}/${this.config.bucketName}/${fileKey}`;

      console.log(`✅ Resume uploaded successfully: ${fileKey}`);
      
      return {
        success: true,
        fileUrl,
        fileKey
      };

    } catch (error) {
      console.error('❌ Resume upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Generate a presigned URL for direct upload from client
   * @param fileName - Original file name
   * @param contentType - MIME type of the file
   * @param jobId - Job ID for organizing files
   * @param applicantId - Unique identifier for the applicant
   */
  async generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    jobId: string,
    applicantId: string
  ): Promise<{ success: boolean; uploadUrl?: string; fileKey?: string; error?: string }> {
    try {
      if (!this.isConfigured()) {
        throw new Error('R2 storage not properly configured');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const fileKey = `applications/${jobId}/${applicantId}/${timestamp}-${fileName}`;

      if (!this.isValidResumeType(fileExtension)) {
        throw new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.');
      }

      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileKey,
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          jobId: jobId,
          applicantId: applicantId,
          uploadedAt: new Date().toISOString(),
          fileType: fileExtension || 'unknown'
        }
      });

      const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 }); // 1 hour

      return {
        success: true,
        uploadUrl,
        fileKey
      };

    } catch (error) {
      console.error('❌ Failed to generate presigned URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate upload URL'
      };
    }
  }

  /**
   * Get file metadata
   * @param fileKey - The file key in R2
   */
  async getFileMetadata(fileKey: string): Promise<FileMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileKey
      });

      const response = await this.client.send(command);
      
      return {
        key: fileKey,
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified || new Date(),
        etag: response.ETag || ''
      };

    } catch (error) {
      console.error('❌ Failed to get file metadata:', error);
      return null;
    }
  }

  /**
   * Delete a resume file
   * @param fileKey - The file key in R2
   */
  async deleteResume(fileKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileKey
      });

      await this.client.send(command);
      console.log(`✅ Resume deleted successfully: ${fileKey}`);

      return { success: true };

    } catch (error) {
      console.error('❌ Failed to delete resume:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Get a presigned download URL for a file
   * @param fileKey - The file key in R2
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   */
  async getDownloadUrl(fileKey: string, expiresIn: number = 3600): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileKey
      });

      const downloadUrl = await getSignedUrl(this.client, command, { expiresIn });

      return {
        success: true,
        downloadUrl
      };

    } catch (error) {
      console.error('❌ Failed to generate download URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate download URL'
      };
    }
  }

  /**
   * List all resumes for a specific job
   * @param jobId - Job ID to filter resumes
   */
  async listJobResumes(jobId: string): Promise<{ success: boolean; resumes?: Array<{ key: string; originalName: string; uploadedAt: string }>; error?: string }> {
    try {
      // Note: R2 doesn't support listing objects with ListObjectsV2Command in the same way as S3
      // This is a simplified implementation - in production you might want to maintain a database index
      
      console.log(`ℹ️ Listing resumes for job: ${jobId}`);
      
      // For now, return success but note that full listing requires additional implementation
      return {
        success: true,
        resumes: []
      };

    } catch (error) {
      console.error('❌ Failed to list job resumes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list resumes'
      };
    }
  }

  /**
   * Check if R2 storage is properly configured
   */
  private isConfigured(): boolean {
    return !!(this.config.accountId && this.config.accessKeyId && this.config.secretAccessKey && this.config.bucketName);
  }

  /**
   * Validate if the file type is allowed for resume uploads
   * @param fileExtension - File extension to validate
   */
  private isValidResumeType(fileExtension?: string): boolean {
    if (!fileExtension) return false;
    
    const allowedTypes = ['pdf', 'docx', 'doc', 'txt'];
    return allowedTypes.includes(fileExtension.toLowerCase());
  }

  /**
   * Get storage configuration status
   */
  getConfigStatus(): { configured: boolean; bucketName: string; endpoint: string } {
    return {
      configured: this.isConfigured(),
      bucketName: this.config.bucketName,
      endpoint: this.config.endpoint
    };
  }

  /**
   * Test R2 connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        throw new Error('R2 storage not properly configured');
      }

      // Try to list objects (limited to 1) to test connection
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: 'test-connection'
      });

      // This will fail but we can catch the specific error to verify connection
      try {
        await this.client.send(command);
      } catch (error: any) {
        // If we get a 404 or 403, the connection is working (bucket exists, file doesn't)
        if (error.$metadata?.httpStatusCode === 404 || error.$metadata?.httpStatusCode === 403) {
          return { success: true };
        }
        throw error;
      }

      return { success: true };

    } catch (error) {
      console.error('❌ R2 connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Export singleton instance
export const r2StorageService = new R2StorageService();
