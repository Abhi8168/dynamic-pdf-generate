import { join } from 'path';

export default {
  PDF_TEMPLATE_PATH: join(
    process.cwd(),
    'lib',
    'pdf-template',
    'main1-pdf.template.html',
  ),
  UPLOADED_PDF_DIRECTORY: join(process.cwd(), 'public', 'uploaded-pdf'),
  UPLOADED_IMAGE_DIRECTORY: join(process.cwd(), 'public', 'images'),
  firstLogoUrl: 'http://localhost:3000/images/logo1.png',
  secondLogoUrl: 'http://localhost:3000/images/logo2.png',
};
