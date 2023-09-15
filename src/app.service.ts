import { Injectable } from '@nestjs/common';

@Injectable()//provider
export class AppService {
  getHello(): string {
    return 'Hello NestJS';
  }
}
