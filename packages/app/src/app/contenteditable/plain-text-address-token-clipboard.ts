import Quill from 'quill';
import { QuillBlotService } from './quill-blot.service';

const Clipboard: any = Quill.import('modules/clipboard');

export class PlainTextWithAddressTokenClipboard extends Clipboard {
  async onPaste(selection: any, data: { html: string; text: string }) {
    return QuillBlotService.handlePaste(selection, data, this['quill'] as Quill);
  }
}
