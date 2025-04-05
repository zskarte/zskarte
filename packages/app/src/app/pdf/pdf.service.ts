import { Injectable } from '@angular/core';
import { generate } from '@pdfme/generator';
import { text, image, dateTime, line, checkbox, barcodes, rectangle } from '@pdfme/schemas';
import { I18NService } from '../state/i18n.service';
import { IPdfService } from './pdf-service.factory';
import saveAs from 'file-saver';

const fontConfigs = {
  fonts: {
    Roboto: '/assets/fonts/Roboto-Regular.ttf',
    RobotoBold: '/assets/fonts/Roboto-Bold.ttf',
    RobotoItalic: '/assets/fonts/Roboto-Italic.ttf',
    RobotoBoldItalic: '/assets/fonts/Roboto-BoldItalic.ttf',
  },
  fallback: 'Roboto',
};

const plugins = {
  text,
  image,
  dateTime,
  line,
  checkbox,
  qrcode: barcodes.qrcode,
  rectangle,
};

const PT_to_MM = 25.4 / 72;
const MM_to_PX = 96 / 25.4;
const PT_to_PX = 96 / 72;

@Injectable({
  providedIn: 'root',
})
export class PdfService implements IPdfService {
  private fonts: any;

  constructor(private _i18n: I18NService) {}

  async fetchImageAsBase64(url: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string | ArrayBuffer | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      return null;
    }
  }

  async processInputsWithSchema(inputs: any[], template: { schemas: any[][] }) {
    return Promise.all(
      inputs.map(async (input, index) => {
        const schema = template.schemas[index];
        const processedInput = { ...input };

        for (const field of schema) {
          if (field.type === 'image' && input[field.name] && input[field.name].startsWith('http')) {
            //if field type is 'image' convert URLs to Base64
            processedInput[field.name] = await this.fetchImageAsBase64(input[field.name]);
          } else if (field.type === 'text') {
            if (field.name?.startsWith('i18n:')) {
              //if field name has 'i18n:' prefix load corresponsing text for language
              processedInput[field.name] = this._i18n.get(field.name.substring(5));
            } else if (field.name?.startsWith('i18n_colon:')) {
              //if field name has 'i18n_colon:' prefix load corresponsing text for language and append a colon
              processedInput[field.name] = this._i18n.get(field.name.substring(11)) + ':';
            } else if (field.name?.startsWith('i18n_val:')) {
              //if field name has 'i18n_val:' prefix load corresponsing text for language for the value
              const fieldName = field.name.substring(9);
              if (input[fieldName]) {
                processedInput[field.name] = this._i18n.get(input[fieldName]);
              }
            } else if (field.content?.startsWith('i18n:')) {
              //if field default content has 'i18n:' prefix load corresponsing text for language
              processedInput[field.name] = this._i18n.get(field.content.substring(5));
            } else if (field.content?.startsWith('i18n_colon:')) {
              //if field default content has 'i18n_colon:' prefix load corresponsing text for language and append a colon
              processedInput[field.name] = this._i18n.get(field.content.substring(11)) + ':';
            } else if (input[field.name] && typeof input[field.name] !== 'string') {
              //if value is e.g. number than an error will occure
              processedInput[field.name] = input[field.name].toString();
            }
          } else if (field.type === 'checkbox') {
            if (typeof input[field.name] === 'boolean') {
              //value need to be string to make checkbox work
              processedInput[field.name] = input[field.name].toString();
            } else if (field?.name.startsWith('equals:')) {
              //convert value of field to checkbox 'equals:entry.field=value'
              const [fieldName, requiredValue] = field.name.substring(7).split('=', 2);
              processedInput[field.name] = (input[fieldName] === requiredValue).toString();
            }
          } else if (
            input[field.name] &&
            typeof input[field.name] === 'object' &&
            input[field.name].constructor?.name === 'Date'
          ) {
            processedInput[field.name] = (input[field.name] as Date).toISOString();
          }
        }

        return processedInput;
      }),
    );
  }

  public flattenObject(obj: any, prefix = ''): Record<string, any> {
    return Object.keys(obj).reduce((acc: Record<string, any>, k: string) => {
      if (
        typeof obj[k] === 'object' &&
        obj[k] !== null &&
        !Array.isArray(obj[k]) &&
        obj[k].constructor?.name !== 'Date'
      ) {
        Object.assign(acc, this.flattenObject(obj[k], prefix + k + '.'));
      } else {
        acc[prefix + k] = obj[k];
      }
      return acc;
    }, {});
  }

  public async getFonts() {
    if (!this.fonts) {
      const fonts = {};

      for (const [key, value] of Object.entries(fontConfigs.fonts)) {
        fonts[key] = {
          data: await fetch(value).then((res) => res.arrayBuffer()),
          fallback: fontConfigs.fallback === key,
        };
      }
      this.fonts = fonts;
    }
    return this.fonts;
  }

  public getPlugins() {
    return plugins;
  }

  private findFieldInTemplate(template: any, fieldName: string) {
    for (const schema of template.schemas) {
      for (const field of schema) {
        if (field.name === fieldName) {
          return field;
        }
      }
    }
    return null;
  }

  public checkTextFitInField(template: any, fieldName: string, text: string) {
    try {
      // Create a temporary canvas element for measuring text dimensions
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        canvas.remove();
        return false;
      }
      const field = this.findFieldInTemplate(template, fieldName);
      if (!field || field.type !== 'text') {
        return false;
      }
      const fieldWidth = field.width * MM_to_PX;
      const fieldHeight = field.height * MM_to_PX;
      const fontSize = field.fontSize * PT_to_PX;
      const lineHeight = fontSize * field.lineHeight;
      const fontFamily = field.fontName ?? 'Roboto';

      //Set the font properties
      context.font = `${fontSize}px ${fontFamily}`;

      //Split the text into lines based on manual line breaks
      const manualLines = text.split('\n');
      const lines: string[] = [];

      for (const manualLine of manualLines) {
        //Split each manual line into words
        const words = manualLine.split(' ');
        let currentLine = words[0];

        //Calculate line breaks based on field width
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          if (context.measureText(testLine).width <= fieldWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = words[i];
          }
        }
        lines.push(currentLine);
      }

      //Remove the canvas element
      canvas.remove();

      //Calculate the total height of the text
      const totalHeight = lines.length * lineHeight - MM_to_PX; //first line is 1mm smaller

      //Check if the text fits within the field height
      return totalHeight <= fieldHeight;
    } catch (e) {
      console.error('error while checkTextFitInField for template:', template, 'fieldName:', fieldName, 'text:', text);
      return false;
    }
  }

  public async downloadPdf(template: any, inputs: any, fileName: string) {
    inputs = inputs.map((input: any) => this.flattenObject(input));
    inputs = await this.processInputsWithSchema(inputs, template);

    const pdf = await generate({
      template,
      inputs,
      plugins: this.getPlugins(),
      options: { font: await this.getFonts() },
    });
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    fileName = fileName.replaceAll(/[^a-zA-Z0-9._-]/g, '_');
    saveAs(blob, fileName);
  }
}
