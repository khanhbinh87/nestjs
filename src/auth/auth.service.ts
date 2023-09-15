import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { log } from 'console';
import ms from 'ms';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  getHassPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
  // username and pass la 2 tham so thu vien passport nem ve
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      let isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid) {
        return user;
      }
    }

    return null;
  }
  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refresh_token = this.createRefreshToken(payload);

    //update users with refreshToken
    await this.usersService.updateUserToken(refresh_token, _id);

    //set refreshtoken as cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
      },
    };
  }

  async register(user: RegisterUserDto) {
    let newUser = await this.usersService.register(user);

    return { _id: newUser?._id, createdAt: newUser?.createdAt };
  }
  createRefreshToken = (payload: any) => {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
  };
  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      //todo
      let user = await this.usersService.findUserByToken(refreshToken);

      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };

        const refresh_token = this.createRefreshToken(payload);

        //update users with refreshToken
        await this.usersService.updateUserToken(refresh_token, _id.toString());

        //clear cookies
        // response.clearCookie('refresh_token');
        response.clearCookie('refresh_token');
        //set refreshtoken as cookies

        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
          },
        };
      } else {
        throw new BadRequestException(
          'Refresh token ko hop le . Vui long login',
        );
      }
    } catch (error) {
      throw new BadRequestException('Refresh token ko hop le . Vui long login');
    }
  };
  async logOut(user: IUser, response: Response) {
    await this.usersService.updateUserToken('', user._id);
    response.clearCookie('refresh_token');
    return 'ok';
  }
}
