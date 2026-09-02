import { IZsStrapiAsset } from '@zskarte/types';
import { environment } from '../../environments/environment';

interface ImageResponsiveSource {
  src: string;
  srcSet: string;
}

export type StrapiApiResponseList<T> = {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

const mapInternalUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url;
  }
  return environment.apiUrlNext + url;
};

export const getResponsiveImageSource = (asset: {url: string, formats: object | null} | null) => {
  if (!asset) return undefined;
  const responsiveImageSource: ImageResponsiveSource = { src: mapInternalUrl(asset.url), srcSet: '' };
  if (asset.formats) {
    responsiveImageSource.srcSet = Object.keys(asset.formats)
      .map((key) => {
        const format = asset.formats![key];
        return format.url ? `${mapInternalUrl(format.url)} ${format.width}w` : '';
      })
      .filter((src) => Boolean(src))
      .join(', ');
  }
  return responsiveImageSource;
};
