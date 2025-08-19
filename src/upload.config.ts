// upload.config.ts
import constants from 'lib/common/constants';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: constants.UPLOADED_IMAGE_DIRECTORY, // folder where files will be stored
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(
        null,
        `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
      );
    },
  }),
};
