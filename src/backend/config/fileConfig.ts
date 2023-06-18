import { registerAs } from "@nestjs/config";
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

const fileSize: number = 1024 * 1024 * 50;

export default registerAs('fileConfig', () => ({
    uploadPath: './uploadPath/',
    previewPath: './previewPath/',
    tmpPath: './tmpPath/',
    previewWidth: 720,
    previewHeight: 1280,
    maxPreviews: 10,
    fileSize: fileSize
}));

export const fileMulConfig = {
    storage: diskStorage({
      filename: (request, file, callback) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        callback(null, uuid());
      },
    }),
    limits: {
      fileSize: fileSize
    },
};