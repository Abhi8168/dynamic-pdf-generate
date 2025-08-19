import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import constants from 'lib/common/constants';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { JwtService } from '@nestjs/jwt';

import { generateRandomToken } from 'lib/common/utility.function';
import forgotPassword from 'lib/email/forgotpassword';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async createSuperAdmin(payload) {
    const saltRounds = 10;
    const findEmail = await this.userModel.findOne({
      email: payload?.email,
    });

    if (findEmail) {
      throw new BadRequestException({
        success: false,
        message: 'Email already exists',
      });
    }
    const hashPassword = await bcrypt.hash(payload?.password, saltRounds);
    payload.password = hashPassword;

    let create = await this.userModel.create({ ...payload });

    return payload;
  }

  async signIn(email, password) {
    const user = await this.userSignIn(email, password);
    if (typeof user == 'string') {
      return user;
    }
    if (user) {
      const { _id }: any = user;
      const payload = {
        ...user,
        sub: _id || '',
      };
      // user['module']=await this.roleService.getModules(user.role)
      return {
        user,
        token: await this.jwtService.signAsync(payload),
      };
    } else {
      throw new UnauthorizedException();
    }
  }
  async userSignIn(email, password) {
    // Get the current date using Moment.js

    let data: any = await this.userModel
      .findOne({ email: { $regex: `^${email}$`, $options: 'i' } })
      .select('+password');

    if (!data) {
      throw new NotFoundException({
        success: false,
        message: 'User not exist',
      });
    }
    // Check if the organization has expired
    if (data && data.isDeleted === true) {
      throw new NotFoundException({
        success: false,
        message: 'This account is not registered',
      });
    } else if (data && data.password == undefined) {
      throw new UnauthorizedException({
        success: false,
        message: 'please set your password first then back to login',
      });
    } else {
      let compare = await bcrypt.compare(password, data.password);
      if (compare) {
        const userData: any = await this.userModel
          .findOne({ email: { $regex: `^${email}$`, $options: 'i' } })
          .lean();

        return userData;
      } else {
        throw new ForbiddenException({
          success: false,
          message: 'Username or Password is not correct',
        });
      }
    }
  }

  async getById(userDetail) {
    const data = await this.userModel.findOne({ _id: userDetail._id });

    if (!data) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
      });
    }
    return data;
  }

  async forgotPassword(data) {
    try {
      const { email } = data;
      let find = await this.userModel.findOne({ email: email });
      if (find) {
        const random = generateRandomToken();
        const url = `${process.env.BASE_URI}/reset-password?email=${email}&token=${random}`;
        await forgotPassword(email, find.name, url);
        let updateToken = await this.userModel
          .findOneAndUpdate({ email: email }, { $set: { token: random } })
          .select('+token');
        return updateToken;
      } else {
        throw new NotFoundException({
          success: false,
          message: 'Email not found',
        });
      }
    } catch (err) {
      throw err;
    }
  }
  async resetPassword(email, token, password) {
    if (token === undefined || email === undefined || token == '') {
      return 'please Provide necessary details';
    }
    let find = await this.userModel
      .findOne({ email: email, token: token })
      .select('+password');
    if (find) {
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(password, saltRounds);
      // log
      return await this.userModel.findByIdAndUpdate(
        { _id: find._id },
        { $set: { password: hashPassword, token: '' } },
      );
    } else {
      return 'Invalid password reset link';
    }
  }
  // async updateProfile(id: ObjectId | string, userDetail, updateDetails, image) {
  //   const userData = await this.userModel.findOne({
  //     $and: [{ _id: id }, { _id: userDetail?._id }],
  //   });

  //   if (!userData) {
  //     throw new NotFoundException({
  //       success: false,
  //       message: constants.COMMON_MESSAGES.IN_CASE_USER_NOT_EXIST,
  //     });
  //   }
  //   if (image) {
  //     image = await saveFile(
  //       image,
  //       constants.IMAGES_PATH.USER_IMAGE_FOLDER_PATH,
  //     );
  //   }
  //   const updatedUser = await this.userModel.findByIdAndUpdate(
  //     userData._id,
  //     {
  //       $set: {
  //         name: updateDetails?.name,
  //         email: updateDetails?.email,
  //         userImage: image,
  //       },
  //     },
  //     { new: true },
  //   );

  //   // Delete Old Image
  //   if (userData?.userImage && updatedUser?.userImage !== userData?.userImage) {
  //     try {
  //       await deleteImage(userData?.userImage);
  //     } catch (err) {
  //       await this.userModel.findByIdAndUpdate(
  //         userData._id,
  //         {
  //           $set: {
  //             userImage: userData?.userImage,
  //           },
  //         },
  //         { new: true },
  //       );
  //       throw err;
  //     }
  //   }

  //   return updatedUser;
  // }

  async changePassword(data, userDetail) {
    const { email, oldPassword, newPassword } = data;
    const user = await this.userModel
      .findOne({
        _id: userDetail?._id,
        $and: [
          {
            email: userDetail?.email,
          },
          {
            email: email,
          },
        ],
      })
      .select('+password');
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found or email does not match',
      });
    }
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user?.password);
    let compare = await bcrypt.compare(newPassword, user?.password);
    if (!isPasswordCorrect) {
      throw new ForbiddenException({
        success: false,
        message: 'Incorrect old password please verify again',
      });
    } else if (compare) {
      throw new ForbiddenException({
        success: false,
        message: 'New password cannot be same as old password',
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return { success: true, message: 'Password updated successfully' };
  }
}
