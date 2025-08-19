import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from 'lib/common/decorator';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('/sign-up')
  async createSuperAdmin(@Res() res: any, @Body() dto: any) {
    try {
      let data = await this.userService.createSuperAdmin(dto);
      return res.status(HttpStatus.CREATED).json({
        status: true,
        message: 'Signup successfully',
      });
    } catch (err) {
      if (err instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json(err.getResponse());
      }
      if (err instanceof ForbiddenException) {
        return res.status(HttpStatus.FORBIDDEN).json(err.getResponse());
      }
      throw new InternalServerErrorException({
        status: false,
        message: 'Something went wrong, please try again later.',
      });
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() payload: any, @Req() req: any, @Res() res: any) {
    try {
      let data: any = await this.userService.signIn(
        payload.email,
        payload.password,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        data: data?.user,
        accessToken: data?.token,
      });
    } catch (err) {
      if (err instanceof ForbiddenException) {
        return res.status(HttpStatus.FORBIDDEN).json(err.getResponse());
      } else if (err instanceof UnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).json(err.getResponse());
      } else if (err instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json(err.getResponse());
      } else if (err instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json(err.getResponse());
      } else {
        throw new InternalServerErrorException({
          success: false,
          message: 'Something went wrong, please try again later.',
        });
      }
    }
  }

  @Get('userDetails')
  async userDetail(@Req() req: any, @Res() res: any) {
    try {
      const userDetail = req?.user;

      const data = await this.userService.getById(userDetail);
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (error) {
      if (error instanceof BadRequestException)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ status: false, message: error.getResponse() });

      throw new InternalServerErrorException({
        status: false,
        message: 'Something went wrong, please try again later.',
      });
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Res() res: any, @Body() email: any, @Req() req: any) {
    try {
      let data = await this.userService.forgotPassword(email);
      if (typeof data == 'string') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: data,
        });
      } else {
        return res.status(HttpStatus.OK).json({
          status: true,
          message:
            'An email with reset password link has been sent to the email address',
        });
      }
    } catch (err) {
      console.log(err)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Something went wrong, please try again later.',
      });
    }
  }

  @Public()
  @Patch('/reset-password')
  async resetPassword(
    @Res() res: any,
    @Query('email') email: any,
    @Query('token') token: any,
    @Body() payload: any,
  ) {
    try {
      // Split the token to extract the random string and the expiration timestamp
      const [randomToken, expirationTime] = token.split('|');

      // Check if the current time has exceeded the expiration time
      const currentTime = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds

      if (!expirationTime) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid link',
        });
      }
      if (currentTime > expirationTime) {
        throw new BadRequestException({
          success: false,
          message:
            'Oops! The password reset link has expired. Please request a new link via the Forgot Password',
        });
      }
      let data = await this.userService.resetPassword(
        email,
        token,
        payload.password,
      );
      if (typeof data == 'string') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: data,
        });
      } else {
        return res.status(HttpStatus.CREATED).json({
          success: true,
          message: 'your password has been changed successfully.',
        });
      }
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Something went wrong, please try again later.',
      });
    }
  }

  // @Put('update/:id')
  // @UseInterceptors(FileInterceptor('image'))
  // async updateProfile(
  //   @Req() req: any,
  //   @Res() res: any,
  //   @Body() details: UpdateUserDto,
  //   @UploadedFile() image: Express.Multer.File, // Access the uploaded fil
  //   @Param('id') id: ObjectId,
  // ) {
  //   try {
  //     const userDetail = req?.user;
  //     if (userDetail?.role?.name !== constants.ROLE.SUPER_ADMIN) {
  //       throw new BadRequestException({
  //         status: false,
  //         message: constants.COMMON_MESSAGES.IN_CASE_NOT_ALLOWED_FOR_OPERATION,
  //       });
  //     }
  //     const update = await this.userService.updateProfile(
  //       id,
  //       userDetail,
  //       details,
  //       image,
  //     );
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'Profile updated successfully',
  //     });
  //   } catch (err) {
  //     if (err instanceof NotFoundException) {
  //       return res.status(HttpStatus.NOT_FOUND).json(err.getResponse());
  //     } else if (err instanceof BadRequestException) {
  //       return res.status(HttpStatus.BAD_REQUEST).json(err.getResponse());
  //     } else if (err instanceof ForbiddenException) {
  //       return res.status(HttpStatus.FORBIDDEN).json(err.getResponse());
  //     } else if (err.code === 11000) {
  //       // Duplicate key error
  //       return res.status(HttpStatus.CONFLICT).json({
  //         success: false,
  //         message: 'Email already exists',
  //       });
  //     }
  //     throw new InternalServerErrorException({
  //       success: false,
  //       message: constants.COMMON_MESSAGES.IN_CASE_INTERNAL_SERVER_ERROR,
  //     });
  //   }
  // }

  @Patch('change-password')
  async changePassword(@Req() req: any, @Res() res: any, @Body() data: any) {
    try {
      const userDetail = req?.user;

      const result = await this.userService.changePassword(data, userDetail);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json(err.getResponse());
      } else if (err instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json(err.getResponse());
      } else if (err instanceof ForbiddenException) {
        return res.status(HttpStatus.FORBIDDEN).json(err.getResponse());
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Something went wrong, please try again later.',
        });
      }
    }
  }
}
