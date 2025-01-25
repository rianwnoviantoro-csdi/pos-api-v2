import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export const uploadImageToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        format: 'webp',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    const fileStream = Readable.from(file.buffer);
    fileStream.pipe(stream);
  });
};

export const deleteImageFromCloudinary = async (url: string): Promise<any> => {
  const regex = /\/upload\/([^\/]+)\/([^\/]+)\/([^\/]+)\.([a-zA-Z0-9]+)/;
  const match = url.match(regex);

  if (!match || !match[1] || !match[2]) {
    throw new Error('Invalid Cloudinary URL');
  }

  const publicId = `${match[2]}/${match[3]}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};
