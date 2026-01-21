import Quill from 'quill';
const Clipboard: any = Quill.import('modules/clipboard');
import { QuillBlotService } from './quill-blot.service';

export class PlainTextWithAddressTokenClipboard extends Clipboard {
  async onPaste(selection: any, data: { html: string; text: string }) {
    return QuillBlotService.handlePaste(selection, data, this['quill'] as Quill);
  }
}
