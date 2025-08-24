import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { servePdf } from 'lib/common/utility.function';
import constants from 'lib/common/constants';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './upload.config';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'locationTableImage', maxCount: 1 },
        { name: 'complexImageUrl', maxCount: 1 },
        { name: 'locationFtuImageUrl', maxCount: 1 },
        { name: 'schematicDrawingImageUrl', maxCount: 1 },
        { name: 'locatieImages', maxCount: 10 },
        { name: 'beslisboomImages', maxCount: 10 },
        { name: 'aanzichtComplexImages', maxCount: 10 },
        { name: 'beschrijvingInvoerpuntenImages', maxCount: 10 },
        { name: 'locatieFTUImages', maxCount: 10 },
        { name: 'schematischeTekeningImages', maxCount: 10 },
      ],
      multerConfig,
    ),
  )
  async uploadSurvey(
    @UploadedFiles() files: Record<string, any[]>,
    @Body() body: any,
    @Res() res: any,
  ) {
    try {
      // Convert JSON strings inside body back into objects
      if (body?.locationTable)
        body.locationTable = JSON.parse(body.locationTable);
      if (body?.decisionTree) body.decisionTree = JSON.parse(body.decisionTree);
      if (body?.jobDescription)
        body.jobDescription = JSON.parse(body.jobDescription);
      if (body?.site_survey) body.site_survey = JSON.parse(body.site_survey);
      if(body?.opmerkingen) body.opmerkingen = JSON.parse(body.opmerkingen);
      if(body?.strenglijsten) body.strenglijsten = JSON.parse(body.strenglijsten);
      if(body?.decisionTree_notesText) body.decisionTree_notesText = JSON.parse(body.decisionTree_notesText);


      // Now replace uploaded image fields with URLs
      const baseUrl = `${process.env.BASE_URI}/images`; // update if needed

      // Object.keys(files).forEach((key) => {
      //   if (Array.isArray(files[key])) {
      //     if (files[key].length === 1) {
      //       // Single file (replace string)
      //       body[key] = `${baseUrl}/${files[key][0].filename}`;
      //     } else {
      //       // Multiple files (replace array)
      //       body[key] = files[key].map((f) => ({
      //         url: `${baseUrl}/${f.filename}`,
      //         alt: f.originalname,
      //       }));
      //     }
      //   }
      // });
      Object.keys(files).forEach((key) => {
        if (Array.isArray(files[key])) {
          // Always treat as array, even if only one file
          body[key] = files[key].map((f) => ({
            url: `${baseUrl}/${f.filename}`,
            alt: f.originalname,
          }));
        }
      });

      const data = await this.appService.createPdf(body);

      return res.status(HttpStatus.OK).json({
        success: true,
        data: join(constants.UPLOADED_PDF_DIRECTORY, data.fileName),
      });
    } catch (error) {
      console.log('Error processing form data:', error);
      throw new InternalServerErrorException({
        success: false,
        message: error,
      });
    }
  }

  @Get('downloadPdf')
  async getPdf(@Res() res: any, @Query('pdfPath') pdfPath: any) {
    try {
      if (!pdfPath) {
        throw new InternalServerErrorException({
          success: false,
          message: 'File name is required',
        });
      }
      return servePdf(res, pdfPath);
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Something went wrong while generating the PDF',
      });
    }
  }
}
