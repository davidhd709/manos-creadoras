import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner } from './schemas/banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<Banner>) {}

  listActive() {
    return this.bannerModel.find({ active: true }).exec();
  }

  create(dto: CreateBannerDto) {
    return this.bannerModel.create(dto);
  }
}
