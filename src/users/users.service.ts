import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { IUser } from './users.interface';
import { User } from 'src/decorator/customize';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}
  getHassPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    const { name, email, password, age, gender, address, role, company } =
      createUserDto;
    let checkExistEmail = await this.userModel.findOne({ email });
    if (checkExistEmail) {
      throw new BadRequestException(`Email ${email} da ton tai .`);
    }
    let hassPassword = this.getHassPassword(password);

    let newUser = await this.userModel.create({
      email,
      password: hassPassword,
      name,
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return newUser;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    let { filter, population, sort } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;

    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      // .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query total: totalItems // tổng số phần tử (số bản ghi)
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return { msg: `Not found user` };
    let result = await this.userModel.findOne({ _id: id }).select('-password');
    return result;
  }
  async findOneByUsername(username: string) {
    return await this.userModel.findOne({ email: username });
  }
  isValidPassword(pass: string, hash: string) {
    return compareSync(pass, hash);
  }

  async update(updateUserDto: UpdateUserDto, @User() user: IUser) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }
  async remove(id: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return { msg: `Not found user` };
    await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.userModel.softDelete({ _id: id });
  }

  async register(user: RegisterUserDto) {
    let { name, email, password, age, gender, address } = user;
    let checkExistEmail = await this.userModel.findOne({ email });
    if (checkExistEmail) {
      throw new BadRequestException(`Email ${email} da ton tai .`);
    }
    let hassPassword = this.getHassPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hassPassword,
      age,
      gender,
      address,
      role: 'USER',
    });

    return newRegister;
  }
  async updateUserToken(refresh_token: string, _id: string) {
    return await this.userModel.updateOne({ _id }, { refresh_token });
  }
  async findUserByToken(refresh_token:string) {
    return await this.userModel.findOne({ refresh_token });
  }
  
}
