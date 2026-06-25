import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class UploadService {
  uploadBuffer(buffer: Buffer, folder = 'manos-creadoras'): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'webp',
          transformation: [
            { quality: 'auto:good' },
            { width: 1200, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(new InternalServerErrorException('Error al subir imagen a Cloudinary'));
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }
}
