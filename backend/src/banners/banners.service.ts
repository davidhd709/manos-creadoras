import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.banner.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }
}
