import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { SeoService } from './seo.service';

@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async sitemap(@Res() res: Response) {
    const xml = await this.seoService.getSitemap();
    res.send(xml);
  }
}
