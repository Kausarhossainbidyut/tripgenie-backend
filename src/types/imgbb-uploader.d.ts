declare module 'imgbb-uploader' {
  interface ImgBBUploaderOptions {
    apiKey: string;
    base64string: string;
    name?: string;
    expiration?: number;
  }

  interface ImgBBResponse {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  }

  function imgbbUploader(options: ImgBBUploaderOptions): Promise<ImgBBResponse>;
  export = imgbbUploader;
}
