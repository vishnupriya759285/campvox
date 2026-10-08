import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private supabase: SupabaseClient | null = null;
  private readonly bucketName = 'issue-images';

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (url && key) {
      try {
        this.supabase = createClient(url, key, {
          auth: { persistSession: false },
          realtime: { transport: WebSocket as any },
        });
        this.ensureBucket();
      } catch (err) {
        this.logger.warn(`Failed to initialize Supabase client: ${err.message}`);
      }
    }
  }

  private async ensureBucket() {
    if (!this.supabase) return;
    try {
      const { data: buckets } = await this.supabase.storage.listBuckets();
      const exists = buckets?.some((b) => b.name === this.bucketName);
      if (!exists) {
        await this.supabase.storage.createBucket(this.bucketName, { public: true });
        this.logger.log(`Created Supabase storage bucket '${this.bucketName}'`);
      }
    } catch (e) {
      this.logger.warn(`Supabase bucket check: ${e.message}`);
    }
  }

  async uploadBase64Image(base64Data: string, originalName: string = 'issue.jpg'): Promise<string> {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.');
    }

    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    if (buffer.length > maxSizeBytes) {
      throw new BadRequestException('File size exceeds the 25MB limit.');
    }

    const ext = mimeType.split('/')[1] || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (this.supabase) {
      try {
        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!error) {
          const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(fileName);
          return data.publicUrl;
        }
      } catch (err) {
        this.logger.warn(`Direct upload to Supabase storage failed: ${err.message}. Falling back to inline URI.`);
      }
    }

    // Resilient fallback to data URL if cloud bucket is restricted
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }
}
