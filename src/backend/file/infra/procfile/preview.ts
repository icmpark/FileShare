import sharp from 'sharp';
import { v4 } from 'uuid';
import child_process from 'child_process';
import fs from 'fs';

enum ConvertType {
    IMAGE,
    VIDEO,
    OTHER,
}

const videoHandler = async (input, output, options) => {
    try {
        const ffmpegArgs = ['-y', '-i', input, '-vf', 'thumbnail', '-frames:v', '1', output];
        if (options.width > 0 && options.height > 0)
            ffmpegArgs.splice(4, 1, 'thumbnail,scale=' + options.width + ':' + options.height)
        child_process.execFileSync('ffmpeg', ffmpegArgs);
        return true;
    } catch (e) {
        if (fs.existsSync(output))
            fs.unlinkSync(output)
        return false;
    }
}

const imageHandler = async (input, output, options) => {
    const extOutput = options.extOutput;
    const code = v4();
    const temp = options.tmpPath + `${code}.${extOutput}`;

    try {
        const convertArgs = [
            input + '[0]',
            '-resize', options.width + 'x' + options.height,
            '-gravity', 'center',
            '-background', 'white',
            '-format', extOutput,
            '-quality', options.quality,
            '-extent', options.width + 'x' + options.height,
            temp
        ];
        child_process.execFileSync('convert', convertArgs);
        fs.copyFileSync(temp, output);
        return true;
    } catch (e) {
        if (fs.existsSync(temp))
            fs.unlinkSync(temp)

        if (fs.existsSync(output))
            fs.unlinkSync(output)
        return false;
    }
}

export const genSharpPreview = async (input, output, options) => {
    try 
    { 
        await sharp(input)
            .resize({ 
                width: options.width, 
                height:options.height, 
                fit: 'contain',
                background: { r: 255, g: 255, b: 255 } 
            })
            .jpeg({ quality: options.quality, chromaSubsampling: '4:4:4' })
            .toFile(output);
        return true;
    } 
    catch (e)
    { 
        if (fs.existsSync(output)) 
            fs.unlinkSync(output);
        return false;
    }
}

const otherHandler = async (input, output, options) => {
    const code = v4();
    const temp = options.tmpPath + `${code}.png`;

    try {
        child_process.execFileSync(
            'unoconvert', 
            ['--convert-to', 'png', input, temp]
        );
        await genSharpPreview(temp, output, options);

        fs.unlinkSync(temp);
        return true;
    } catch (e) { 
        if (fs.existsSync(output))
            fs.unlinkSync(output);
            
        if (fs.existsSync(temp))
            fs.unlinkSync(temp);
        return false;
    }
}

const handler_list = [
    imageHandler,
    videoHandler,
    otherHandler
]

export const genPreview = async function(input, output, options) {
    try { if (!fs.lstatSync(input).isFile()) return false; }
    catch (e) { return false; }
    options = options || {};
    const extOutput = options.extOutput;
    const extInput = options.extInput;
    
    if (!['gif', 'jpg', 'png'].includes(extOutput))
        return false;
    
    let fileType;

    if (['jpg', 'pdf', 'gif'].includes(extInput))
        fileType = ConvertType.IMAGE;
    else
        fileType = ConvertType.OTHER;

    
    return await handler_list[fileType](input, output, options);
}

export function isPreviewFile(fileExtension) 
{
    if (fileExtension == undefined || fileExtension == null)
        return false;

    const PREVIEWFILE = [
        'png',
        'jpg',
        'jpeg',
        'gif',
        'pdf',
        'pptx',
        'ppt',
        'docx',
        'doc',
        'txt'
    ];
    return PREVIEWFILE.includes(fileExtension);
}