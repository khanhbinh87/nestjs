import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('User login')
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  // @UseGuards(JwtAuthGuard)
  @ResponseMessage('Register a new user')
  @Post('register')
  create(@Body() registerUserDto: RegisterUserDto) {
    // @Body('email') email: string,
    // @Body('password') password: string,
    // @Body('name') name: string,
    return this.authService.register(registerUserDto);
  }

  @Get('account')
  @ResponseMessage('Get user information')
  handleGetAccount(@User() user: IUser) {
    return { user };
  }

  @Public()
  @Get('refresh')
  @ResponseMessage('Get User by refresh token')
  refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    let refreshToken = request.cookies['refresh_token'];

    return this.authService.processNewToken(refreshToken, response);
  }

  @Post('logout')
  @ResponseMessage('Logout User')
  handleLogOut(
    @User() user:IUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    
    return this.authService.logOut(user,response);
  }
}
