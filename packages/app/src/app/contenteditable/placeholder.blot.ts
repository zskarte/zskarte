import BlockEmbed from 'quill/blots/embed';

export class PlaceholderBlot extends BlockEmbed {
  static override blotName = 'placeholderBlot';
  static override tagName = 'div';
  static override className = 'placeholder-blot';

  static override create(value: { width: number; height: number; text: string | undefined }) {
    const node = super.create() as HTMLElement;
    node.style.width = (value?.width ?? 300) + 'px';
    node.style.height = (value?.height ?? 19) + 'px';
    if (value?.text) {
      node.dataset['placeholderText'] = value.text;
    }
    return node;
  }

  static override value(node: HTMLElement) {
    return {
      width: parseInt(node.style.width, 10) || 300,
      height: parseInt(node.style.height, 10) || 19,
      text: node.dataset['placeholderText'] || '',
    };
  }
}
