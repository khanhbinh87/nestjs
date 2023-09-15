import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose, { Date } from "mongoose";

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;
  @IsNotEmpty()
  name: string;
}
export class CreateJobDto {
  @IsNotEmpty({ message: 'Name ko dc de trong' })
  name: string;

  @IsNotEmpty({ message: 'Skills ko dc de trong' })
  @IsArray({ message: 'skills co dinh dang array' })
  //each tells to run the validation on each item of the array
  @IsString({ each: true, message: 'skill co dinh dang string' })
  skills: string[];

  @IsNotEmpty({ message: 'Salary ko dc de trong' })
  salary: number;

  @IsNotEmpty({ message: 'Quantity ko dc de trong' })
  quantity: number;

  @IsNotEmpty({ message: 'Level ko dc de trong' })
  level: number;

  @IsNotEmpty({ message: 'Description ko dc de trong' })
  description: string;

  @IsNotEmpty({ message: 'StartDate ko dc de trong' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'StartDate co dinh dang la Date ' })
  startDate: Date;

  @IsNotEmpty({ message: 'EndDate ko dc de trong' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'EndDate co dinh dang la Date ' })
  endDate: Date;

  @IsNotEmpty({ message: 'isActive ko dc de trong' })
  @IsBoolean({message:'isActive co dinh dang la boolean'})
  isActive: boolean;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}
