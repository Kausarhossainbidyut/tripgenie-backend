import imgbbUploader from 'imgbb-uploader';
import config from '../config/db';

export const uploadToImgBB = async (base64Image: string, name?: string): Promise<{ url: string; delete_url: string; thumb_url: string }> => {
  try {
    const result = await imgbbUploader({
      apiKey: config.imgbb_api_key,
      base64string: base64Image,
      name: name || undefined,
    });

    return {
      url: result.image.url,
      delete_url: result.delete_url,
      thumb_url: result.thumb.url,
    };
  } catch (error) {
    throw new Error('Failed to upload to imgBB');
  }
};
