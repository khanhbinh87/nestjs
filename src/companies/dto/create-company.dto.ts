
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Name ko dc de trong' })
  name: string;

  @IsNotEmpty({ message: 'Address ko dc de trong' })
  address: string;

  @IsNotEmpty({ message: 'Description ko dc de trong' })
  description: string;

  @IsNotEmpty({message:'Logo ko dc de trong'})
  logo:string
}
