import { registerAs } from "@nestjs/config";
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

const fileSize: number = 1024 * 1024 * 50;

export default registerAs('fileConfig', () => ({
    uploadPath: './uploadPath/',
    previewPath: './previewPath/',
    fileSize: fileSize
}));

export const fileMulConfig = {
    storage: diskStorage({
      filename: (request, file, callback) => {
        callback(null, uuid());
      },
    }),
    limits: {
      fileSize: fileSize
    },
};