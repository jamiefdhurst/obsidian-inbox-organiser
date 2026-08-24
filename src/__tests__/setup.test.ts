declare const createSvg: (
  tag: string,
  info?: any,
  callback?: (el: SVGElement) => void
) => SVGElement;
declare const createDiv: (info?: any, callback?: (el: HTMLElement) => void) => HTMLElement;

describe('Obsidian DOM shim', () => {
  describe('createSvg', () => {
    it('creates an element in the SVG namespace', () => {
      const el = createSvg('svg');

      expect(el.namespaceURI).toEqual('http://www.w3.org/2000/svg');
      expect(el.tagName).toEqual('svg');
    });

    it('applies the class, attributes and callback', () => {
      const el = createSvg('path', { cls: 'icon', attr: { d: 'M0 0' } }, (svg) =>
        svg.setAttribute('fill', 'none')
      );

      expect(el.getAttribute('class')).toEqual('icon');
      expect(el.getAttribute('d')).toEqual('M0 0');
      expect(el.getAttribute('fill')).toEqual('none');
    });

    it('appends to the parent when called on a node', () => {
      const parent = createDiv();

      const el = (parent as any).createSvg('svg', 'icon');

      expect(parent.children).toHaveLength(1);
      expect(parent.children[0]).toBe(el);
      expect(el.getAttribute('class')).toEqual('icon');
    });
  });

  describe('bare string class argument', () => {
    it('is treated as a class name by createDiv', () => {
      const el = createDiv('my-class');

      expect(el.className).toEqual('my-class');
    });

    it('is treated as a class name by createEl on a node', () => {
      const parent = createDiv();

      const el = (parent as any).createEl('span', 'my-class');

      expect(el.className).toEqual('my-class');
      expect(parent.children[0]).toBe(el);
    });
  });
});
