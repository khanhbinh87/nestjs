import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;
  @IsNotEmpty()
  name: string;
}
export class RegisterUserDto {
  @IsEmail({}, { message: 'Email ko dung dinh dang' })
  @IsNotEmpty({ message: 'Email ko dc de trong' })
  email: string;

  @IsNotEmpty({ message: 'Password ko dc de trong' })
  password: string;

  @IsNotEmpty({ message: 'Name ko dc de trong' })
  name: string;

  @IsNotEmpty({ message: 'Address ko dc de trong' })
  address: string;

  @IsNotEmpty({ message: 'Age ko dc de trong' })
  age: number;

  @IsNotEmpty({ message: 'Gender ko dc de trong' })
  gender: string;

  @IsNotEmpty({ message: 'Role ko dc de trong' })
  role: string;
}

export class CreateUserDto {
  @IsEmail({}, { message: 'Email ko dung dinh dang' })
  @IsNotEmpty({ message: 'Email ko dc de trong' })
  email: string;

  @IsNotEmpty({ message: 'Password ko dc de trong' })
  password: string;

  @IsNotEmpty({ message: 'Name ko dc de trong' })
  name: string;
  @IsNotEmpty({ message: 'Address ko dc de trong' })
  address: string;
  @IsNotEmpty({ message: 'Age ko dc de trong' })
  age: number;
  @IsNotEmpty({ message: 'Gender ko dc de trong' })
  gender: string;
  @IsNotEmpty({ message: 'Role ko dc de trong' })
  role: string;



  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}
