import { User } from './../decorator/customize';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}
  async create(createResumeDto: CreateUserCvDto, @User() user: IUser) {
    let newResume = await this.resumeModel.create({
      email: user.email,
      userId: user._id,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      ],
      createdBy: {
        _id: user._id,
        email: user.email,
      },
      url: createResumeDto.url,
      jobId: createResumeDto.jobId,
      companyId: createResumeDto.companyId,
    });

    return {
      _id: newResume?._id,
      createdAt: newResume?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    let { filter, population, sort } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;

    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      // .sort(sort as any)
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
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadGatewayException(`Not found company with ud=${id}`);
    return await this.resumeModel.findById({ _id: id });
  }

  async update(id: string, status: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadGatewayException(`Not found resume`);

    return await this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        $push: {
          history: {
            status: status,
            updateAt: new Date(),
            updatedBy: { _id: user._id, email: user.email },
          },
        },
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, @User() user: IUser) {
    await this.resumeModel.updateOne(
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
    return this.resumeModel.softDelete({
      _id: id,
    });
  }
  async findByUsers(user:IUser){
    return await this.resumeModel.find({
      userId:user._id
    })
  }
}
