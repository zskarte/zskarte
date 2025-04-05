import { Injectable, inject } from '@angular/core';
import { I18NService } from '../state/i18n.service';

export interface IPdfService {
  fetchImageAsBase64(url: string): Promise<string | ArrayBuffer | null>;
  processInputsWithSchema(inputs: any[], template: { schemas: any[][] }): Promise<any[]>;
  flattenObject(obj: any, prefix?: string): Record<string, any>;
  getFonts(): Promise<Record<string, { data: string | ArrayBuffer; fallback: boolean }>>;
  getPlugins(): Record<string, any>;
  checkTextFitInField(template: any, fieldName: string, text: string): boolean;
  downloadPdf(template: any, inputs: any, fileName: string): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PdfServiceFactory {
  private pdfServiceInstance: IPdfService | null = null;

  constructor(private i18n: I18NService) {}

  async getPdfService(): Promise<IPdfService> {
    if (!this.pdfServiceInstance) {
      const { PdfService } = await import('./pdf.service');
      this.pdfServiceInstance = new PdfService(this.i18n) as IPdfService;
    }
    return this.pdfServiceInstance;
  }
}
