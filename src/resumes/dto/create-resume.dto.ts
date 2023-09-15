import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Email ko dc de trong' })
  email: string;

  @IsNotEmpty({ message: 'UserId ko dc de trong' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Status ko dc de trong' })
  status: string;

  @IsNotEmpty({ message: 'Url ko dc de trong' })
  url: string;

  @IsNotEmpty({ message: 'CompanyId ko dc de trong' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'JobId ko dc de trong' })
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCvDto {
  @IsNotEmpty({ message: 'Url ko dc de trong' })
  url: string;
  @IsNotEmpty({ message: 'CompanyId ko dc de trong' })
  @IsMongoId({ message: 'companyId is a mongo id' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'JobId ko dc de trong' })
  @IsMongoId({ message: 'jobId is a mongo id' })
  jobId: mongoose.Schema.Types.ObjectId;
}
