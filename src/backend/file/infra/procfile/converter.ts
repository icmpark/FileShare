import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import { v4 } from 'uuid';
import { ConfigType } from '@nestjs/config';
import fileConfig from '../../../config/fileConfig.js';
import { genPreview, genSharpPreview, isPreviewFile } from './preview.js';
import yauzl from 'yauzl-promise';
import archiver from 'archiver';

type EFile = Express.Multer.File;
type FConfig = ConfigType<typeof fileConfig>;

const convertCase = [
    async (files: EFile[]) => {
        if (files.length != 1)
            return false;
        
        const [ file ] = files;
        const ext = (await fileTypeFromFile(file.path))?.ext;

        if (ext === 'zip')
            return true;
        return false;
    },
    async (files: EFile[]) => files.length == 1,
    async (files: EFile[]) => files.length > 1
]


const convertHandlers = [
    zipFileHandler,
    singleFileHandler,
    multiFileHandler
];

async function getCase(files: EFile[]) {
    for (let i = 0; i < convertCase.length; i += 1)
        if ((await convertCase[i](files)))
            return i;
}


async function singleFileHandler(files: EFile[], config: FConfig, title: string): Promise<[string, string, string[]]> {

    const [ file ] = files;
    const ext = (await fileTypeFromFile(file.path))?.ext;

    let previewFile = []
    if (isPreviewFile(ext))
    {
        const preview = await fileToIMG(file.path, ext, config)
        if(preview)
            previewFile.push(preview);
    }
    await fs.promises.copyFile(file.path, config.uploadPath + file.filename);
    await fs.unlinkSync(file.path);

    return [file.filename, file.originalname, previewFile];
}


function getExtension(fileName) 
{
    if (fileName.indexOf('.') == -1)
        return null;
    let splitFile = fileName.split('.');
    return splitFile[splitFile.length - 1]; 
}

async function zipFileHandler(files: EFile[], config: FConfig, title: string): Promise<[string, string, string[]]> {
    const [ file ] = files;

    const zipfile = await yauzl.open(file.path);
    
    let promises = [];

    while (true)
    {
        // entry는 filename인데 type에는 fileName으로 지정되어있음...
        const entry: any = await zipfile.readEntry();
        
        if (entry == null)
            break;

        if (config.maxPreviews == promises.length)
            break;

        const fileEx = getExtension(entry.filename);
        
        if (isPreviewFile(fileEx))
        {   
            const promise = (async () => {
                const codeName = v4();
                const tmpPath = config.tmpPath + codeName;
                await new Promise(async (resolve, _) => {
                    const readStream = await zipfile.openReadStream(entry);
                    const writeStream = fs.createWriteStream(tmpPath);
                    writeStream.on('finish', resolve);
                    readStream.pipe(writeStream);
                });

                const getRealExt = await fileTypeFromFile(tmpPath);
                if (getRealExt == undefined || !isPreviewFile(getRealExt.ext))
                {
                    if(fs.existsSync(tmpPath))
                        fs.unlinkSync(tmpPath);
                    return null;
                }
                else
                {
                    const previewName = await fileToIMG(tmpPath, getRealExt.ext, config);
                    
                    if(fs.existsSync(tmpPath))
                        fs.unlinkSync(tmpPath);
            
                    return previewName;
                }
            })();
            promises.push(promise);
        }
    }

    const previews = (await Promise.all(promises)).filter((result) => result != null);
    await zipfile.close();
    await fs.promises.copyFile(file.path, config.uploadPath + file.filename);
    await fs.unlinkSync(file.path);
    return [file.filename, file.originalname, previews];
}


async function multiFileHandler(files: EFile[], config: FConfig, title: string): Promise<[string, string, string[]]> {
    const codeName = v4();

    let toZ = fs.createWriteStream(config.uploadPath + codeName);
    let fromZ = archiver('zip');

    let promises = [];

    for (const { originalname, path } of files)
    {
        const promise = (async () => {
            let needPreview = promises.length < config.maxPreviews;
            let fileEx = (await fileTypeFromFile(path))?.ext;

            fromZ.append(
                fs.createReadStream(path),
                { name: originalname }
            );

            let newName = null;

            if (needPreview && isPreviewFile(fileEx))
                newName = await fileToIMG(path, fileEx, config);

            return newName;
        })();

        promises.push(promise);
    }
    
    const results = (await Promise.all(promises)).filter((value) => value != null);

    fromZ.pipe(toZ);
    await fromZ.finalize();

    files.forEach((file) => {
        if (fs.existsSync(file.path))
            fs.unlinkSync(file.path);
    })

    return [codeName, title + '.zip', results];
}

export async function saveFile(files: EFile[], config: FConfig, title: string) {
    return await convertHandlers[await getCase(files)](files, config, title);
} 

async function fileToIMG(
    filePath: string,
    ext: string,
    config: FConfig
) {
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext))
        return await makeIMGResize(config, filePath);
    else
        return await makeExtraToIMG(config, filePath, ext);
}


async function makeIMGResize(
    config: FConfig,
    filePath: string,
): Promise<string> {
    const codeName = v4();

    const options = { 
        width: config.previewWidth, 
        height: config.previewHeight, 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 },
        tmpPath: config.tmpPath
    }
    const result = await genSharpPreview(
        filePath,
        config.previewPath + codeName,
        options
    );
    
    if (result)
        return codeName;
    return null;
}


async function makeExtraToIMG(
    config: FConfig,
    filePath: string,
    ext: string
): Promise<string> {
    const codeName = v4();
    const options = { 
        quality : 100,
        width: config.previewWidth,
        height: config.previewHeight,
        extInput : ext,
        extOutput : 'jpg',
        tmpPath: config.tmpPath
    }
    const success = await genPreview(
        filePath, 
        config.previewPath + codeName,
        options
    );

    if (!success)
        return null;
    else
        return codeName;
}