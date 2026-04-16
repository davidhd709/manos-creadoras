import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors, BadRequestException, Req } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = /^image\/(jpeg|jpg|png|webp|gif)$/;

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  @Post('images')
  @Roles(Role.Artisan, Role.Admin, Role.SuperAdmin)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = randomBytes(12).toString('hex');
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED.test(file.mimetype)) {
          return cb(new BadRequestException('Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se subieron archivos');
    }
    const protocol = req.protocol;
    const host = req.get('host');
    const urls = files.map((f) => `${protocol}://${host}/uploads/${f.filename}`);
    return { urls };
  }
}
