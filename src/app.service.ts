import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import constants from 'lib/common/constants'; // Your constants file with PDF_TEMPLATE_PATH
import { createPath, generatePDFBuffer } from 'lib/common/utility.function';
import { PdgGenerateLogService } from './pdf-generate-log/pdf-generate-log.service';
import { join } from 'path';

@Injectable()
export class AppService {
  constructor(private readonly pdgGenerateLogService: PdgGenerateLogService) {}
  async createPdf(payload, userDetail) {
    const pdfTemplate = fs.readFileSync(constants.PDF_TEMPLATE_PATH).toString();

    // Ensure the directory exists
    const uploadedPdfDirectory = constants.UPLOADED_PDF_DIRECTORY;
    await createPath(uploadedPdfDirectory);

    const template = await handlebars.compile(pdfTemplate);

    const htmlContent = await template({
      ...payload,
      locationTableImage: payload?.locationTableImage[0]?.url || '',
      firstLogoUrl: `${process.env.BASE_URI}/static-images/logo1.png`,
      secondLogoUrl: `${process.env.BASE_URI}/static-images/logo2.png`,
      beslisboomImages: [
        {
          url: `${process.env.BASE_URI}/static-images/Beslisboom.jpg`,
          alt: 'Aerial Map View',
        },
      ],
    });

    const footerContent = `
  <div class="footer">
    <div>Plaatsingsdocument: ${payload?.locationTable?.dp || ''} ${payload?.locationTable?.straat_huisnrs || ''}</div>
  </div>
  <style>
    .footer {
      position: absolute;
      bottom: 8mm;
      left: 8mm;
      right: 8mm;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      border-top: 1px solid #000;
      padding-top: 5px;
    }
  </style>
`;

    const pdfBufferData = await generatePDFBuffer(htmlContent, footerContent);

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
    const pdfPathUrl = join(constants.UPLOADED_PDF_DIRECTORY, fileName);
    // Log the PDF generation
    await this.pdgGenerateLogService.createLog(
      userDetail._id,
      payload,
      pdfPathUrl,
    );
    return { pdfFilePath, fileName };
  }
}
