const initImageLightbox = () => {
  // Baseline invoker commands; older browsers keep the original readable images.
  if (!('commandForElement' in HTMLButtonElement.prototype)) return;
  const dialog = document.querySelector<HTMLDialogElement>('[data-image-lightbox]');
  const prose = document.querySelector<HTMLElement>('.prose-terminal');
  if (!dialog || !prose || dialog.dataset.initialized) return;
  dialog.dataset.initialized = 'true';
  let content = dialog.querySelector<HTMLElement>('[data-panzoom-content]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-image-caption]')!;
  const controls = dialog.querySelector<HTMLFieldSetElement>('[data-panzoom-controls]')!;
  let invoker: HTMLButtonElement | null = null;
  let disposeZoom: (() => void) | undefined;
  let activation = 0;
  let backdropStarted = false;

  for (const image of prose.querySelectorAll<HTMLImageElement>('img')) {
    if (image.closest('a, button, [role="button"], [role="link"]')) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'article-image-trigger';
    button.setAttribute('commandfor', dialog.id);
    button.setAttribute('command', 'show-modal');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', image.alt ? `查看大图：${image.alt}` : '查看大图');
    const asset = image.closest('picture') ?? image;
    asset.replaceWith(button);
    button.append(asset);
  }

  // Native command events do not bubble: prepare directly on the target before
  // its show-modal default action. Gestures load only after the first activation.
  dialog.addEventListener('command', (event) => {
    const command = event as Event & { command: string; source: Element | null };
    if (command.command !== 'show-modal' || dialog.open) return;
    const image = command.source?.querySelector<HTMLImageElement>('img');
    if (!image || !(command.source instanceof HTMLButtonElement)) return;
    invoker = command.source;
    invoker.setAttribute('aria-expanded', 'true');
    const asset = (image.closest('picture') ?? image).cloneNode(true) as HTMLElement;
    const viewerImage = asset instanceof HTMLImageElement ? asset : asset.querySelector<HTMLImageElement>('img')!;
    viewerImage.loading = 'eager';
    viewerImage.draggable = false;
    if (viewerImage.srcset) viewerImage.sizes = '100vw';
    // A fresh frame isolates delayed library animation frames from a later open.
    const frame = content.cloneNode(false) as HTMLElement;
    frame.removeAttribute('style');
    frame.append(asset);
    content.replaceWith(frame);
    content = frame;
    caption.textContent = image.title || image.alt || '图片';
    controls.disabled = true;
    const current = ++activation;
    void Promise.all([import('./image-panzoom'), viewerImage.decode()]).then(([{ attachPanzoom }]) => {
      if (current !== activation || !dialog.open || !dialog.isConnected) return;
      disposeZoom = attachPanzoom(dialog);
    }).catch(() => {
      if (current === activation) caption.textContent = `${image.title || image.alt || '图片'} · 图片或缩放工具加载失败，请关闭后重试`;
    });
  });

  dialog.addEventListener('close', () => {
    activation++;
    disposeZoom?.();
    disposeZoom = undefined;
    controls.disabled = true;
    content.replaceChildren();
    invoker?.setAttribute('aria-expanded', 'false');
    if (invoker?.isConnected) invoker.focus({ preventScroll: true });
    invoker = null;
  });
  const outside = (event: PointerEvent | MouseEvent) => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener('pointerdown', (event) => { backdropStarted = outside(event); }, true);
  dialog.addEventListener('click', (event) => {
    if (backdropStarted && outside(event)) dialog.close();
    backdropStarted = false;
  });
  document.addEventListener('astro:before-swap', () => {
    activation++;
    disposeZoom?.();
    if (dialog.open) dialog.close();
  }, { once: true });
};

initImageLightbox();
document.addEventListener('astro:page-load', initImageLightbox);
