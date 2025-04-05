export interface IjsPDF {
  // biome-ignore lint/suspicious/noMisleadingInstantiator: <explanation>
  new (
    orientation?: 'p' | 'portrait' | 'l' | 'landscape',
    unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc',
    format?: string | number[],
  ): IjsPDF;

  setDrawColor(ch1: string): IjsPDF;
  setDrawColor(ch1: number): IjsPDF;
  setDrawColor(ch1: number, ch2: number, ch3: number, ch4?: number): IjsPDF;
  setFileId(value: string): IjsPDF;
  setFillColor(ch1: string): IjsPDF;
  setFillColor(ch1: number, ch2: number, ch3: number, ch4?: number): IjsPDF;
  setFont(fontName: string, fontStyle?: string, fontWeight?: string | number): IjsPDF;
  setFontSize(size: number): IjsPDF;
  setTextColor(ch1: string): IjsPDF;
  setTextColor(ch1: number): IjsPDF;
  setTextColor(ch1: number, ch2: number, ch3: number, ch4?: number): IjsPDF;
  setFontSize(size: number): IjsPDF;
  setFont(fontName: string, fontStyle?: string): IjsPDF;

  addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): IjsPDF;
  rect(x: number, y: number, w: number, h: number, style: string): IjsPDF;
  text(
    text: string,
    x: number,
    y: number,
    options?: any /* jsPDF.TextOptionsLight */,
    transform?: number | any,
  ): IjsPDF;

  getTextDimensions(
    text: string,
    options?: {
      font?: string;
      fontSize?: number;
      maxWidth?: number;
      scaleFactor?: number;
    },
  ): { w: number; h: number };
  splitTextToSize: (text: string, maxlen: number, options?: any) => string[];
  save(filename: string, options: { returnPromise: true }): Promise<void>;
  save(filename?: string): IjsPDF;
  // add additional functions if neded
}

let jsPDFInstance: IjsPDF | null = null;

export async function getJsPDF(): Promise<IjsPDF> {
  if (!jsPDFInstance) {
    const jsPDFModule = await import('jspdf');
    jsPDFInstance = jsPDFModule.jsPDF as unknown as IjsPDF;
  }
  return jsPDFInstance;
}
