import BlockEmbed from 'quill/blots/embed';

export class AddressTokenBlot extends BlockEmbed {
  static override blotName = 'addressToken';
  static override tagName = 'span';
  static override className = 'addr-geo';

  static override create(value: { address: string; option?: string }) {
    const node = super.create() as HTMLElement;
    //on BlockEmebed blot there is automatically an additional element with contenteditable=false that then contain the innerHTML content
    if (value.option) {
      node.setAttribute('data-geo', value.option);
      node.innerHTML = `<span class="addr-show"></span><span class="text addr-search">${value.address}</span><span class="addr-edit"></span>`;
    } else {
      node.innerHTML = `<span class="addr-show addr-unknown"></span><span class="text">${value.address}</span><span class="addr-edit"></span>`;
    }
    return node;
  }

  static override value(node: HTMLElement) {
    return {
      address: node.querySelector('.text')?.textContent || '',
      option: node.getAttribute('data-geo') || undefined,
    };
  }
}
