import { environment } from '../../environments/environment';

export interface ImageResponsiveSource {
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

export const mapInternalUrl = (url?: string | null): string => {
  if (!url) {
    return '';
  }
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const base = environment.apiUrl.replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

export const getResponsiveImageSource = (
  asset: { url: string; formats?: Record<string, { url?: string; width?: number }> | null } | null | undefined,
): ImageResponsiveSource | undefined => {
  if (!asset || !asset.url) return undefined;
  const responsiveImageSource: ImageResponsiveSource = { src: mapInternalUrl(asset.url), srcSet: '' };
  if (asset.formats) {
    responsiveImageSource.srcSet = Object.keys(asset.formats)
      .map((key) => {
        const format = asset.formats![key];
        return format?.url ? `${mapInternalUrl(format.url)} ${format.width}w` : '';
      })
      .filter((src) => Boolean(src))
      .join(', ');
  }
  return responsiveImageSource;
};
