import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import constants from 'lib/common/constants'; // Your constants file with PDF_TEMPLATE_PATH
import { createPath, generatePDFBuffer } from 'lib/common/utility.function';

@Injectable()
export class AppService {
  async createPdf(payload) {
    const pdfTemplate = fs.readFileSync(constants.PDF_TEMPLATE_PATH).toString();

    // Ensure the directory exists
    const uploadedPdfDirectory = constants.UPLOADED_PDF_DIRECTORY;
    await createPath(uploadedPdfDirectory);

    const template = await handlebars.compile(pdfTemplate);

    const htmlContent = await template({
      ...payload,
      firstLogoUrl: `${process.env.BASE_URI}/static-images/logo1.png`,
      secondLogoUrl: `${process.env.BASE_URI}/static-images/logo2.png`,
      beslisboomImages: [
        {
          url: `${process.env.BASE_URI}/static-images/Beslisboom.jpg`,
          alt: 'Aerial Map View',
        },
      ],
    });

    const pdfBufferData = await generatePDFBuffer(htmlContent);

    if (!pdfBufferData) {
      throw new BadRequestException({
        success: false,
        message: 'Something went wrong',
      });
    }
    // Generate a file name (timestamp, UUID, etc.)
    const fileName = `generated-${Date.now()}.pdf`;

    const pdfFilePath = `${uploadedPdfDirectory}/${fileName}`;

    // Create a new PDF document
    fs.writeFileSync(pdfFilePath, pdfBufferData);
    return { pdfFilePath, fileName };
  }
}
