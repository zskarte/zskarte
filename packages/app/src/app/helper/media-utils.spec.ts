import { describe, it, expect } from 'vitest';
import { mapInternalUrl, getResponsiveImageSource } from './media-utils';
import { environment } from '../../environments/environment';

describe('media-utils', () => {
  describe('mapInternalUrl', () => {
    it('returns empty string for null or empty url', () => {
      expect(mapInternalUrl(null)).toBe('');
      expect(mapInternalUrl(undefined)).toBe('');
      expect(mapInternalUrl('')).toBe('');
    });

    it('returns external http / https / protocol-relative URLs unchanged', () => {
      expect(mapInternalUrl('http://example.com/logo.png')).toBe('http://example.com/logo.png');
      expect(mapInternalUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
      expect(mapInternalUrl('//cdn.example.com/logo.png')).toBe('//cdn.example.com/logo.png');
      expect(mapInternalUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
      expect(mapInternalUrl('blob:http://localhost:4200/uuid')).toBe('blob:http://localhost:4200/uuid');
    });

    it('maps internal relative /uploads/... paths against environment.apiUrl', () => {
      const expectedBase = environment.apiUrl.replace(/\/+$/, '');
      expect(mapInternalUrl('/uploads/sample.png')).toBe(`${expectedBase}/uploads/sample.png`);
      expect(mapInternalUrl('uploads/sample.png')).toBe(`${expectedBase}/uploads/sample.png`);
    });
  });

  describe('getResponsiveImageSource', () => {
    it('returns undefined if asset is null or has no url', () => {
      expect(getResponsiveImageSource(null)).toBeUndefined();
      expect(getResponsiveImageSource(undefined)).toBeUndefined();
      expect(getResponsiveImageSource({ url: '' })).toBeUndefined();
    });

    it('returns single src if formats is missing or empty', () => {
      const expectedBase = environment.apiUrl.replace(/\/+$/, '');
      const result = getResponsiveImageSource({ url: '/uploads/original.png' });
      expect(result).toEqual({
        src: `${expectedBase}/uploads/original.png`,
        srcSet: '',
      });
    });

    it('constructs responsive srcSet when formats are present', () => {
      const expectedBase = environment.apiUrl.replace(/\/+$/, '');
      const asset = {
        url: '/uploads/original.png',
        formats: {
          small: { url: '/uploads/small.png', width: 256 },
          medium: { url: '/uploads/medium.png', width: 512 },
          large: { url: 'https://cdn.example.com/large.png', width: 1024 },
        },
      };

      const result = getResponsiveImageSource(asset);
      expect(result).toBeDefined();
      expect(result?.src).toBe(`${expectedBase}/uploads/original.png`);
      expect(result?.srcSet).toContain(`${expectedBase}/uploads/small.png 256w`);
      expect(result?.srcSet).toContain(`${expectedBase}/uploads/medium.png 512w`);
      expect(result?.srcSet).toContain('https://cdn.example.com/large.png 1024w');
    });
  });
});
