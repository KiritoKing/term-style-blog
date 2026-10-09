import Panzoom from '@panzoom/panzoom';

export const attachPanzoom = (dialog: HTMLDialogElement) => {
  const stage = dialog.querySelector<HTMLElement>('[data-panzoom-stage]')!;
  const content = dialog.querySelector<HTMLElement>('[data-panzoom-content]')!;
  const controls = dialog.querySelector<HTMLFieldSetElement>('[data-panzoom-controls]')!;
  const zoomIn = dialog.querySelector<HTMLButtonElement>('[data-zoom-in]')!;
  const zoomOut = dialog.querySelector<HTMLButtonElement>('[data-zoom-out]')!;
  const reset = dialog.querySelector<HTMLButtonElement>('[data-zoom-reset]')!;
  const level = dialog.querySelector<HTMLOutputElement>('[data-zoom-level]')!;
  const events = new AbortController();
  const options = { signal: events.signal };
  const panzoom = Panzoom(content, {
    canvas: true,
    minScale: 1,
    maxScale: 5,
    contain: 'outside',
    panOnlyWhenZoomed: true,
    cursor: 'grab',
    animate: false,
  });
  const update = () => {
    const scale = panzoom.getScale();
    level.value = `${Math.round(scale * 100)}%`;
    zoomIn.disabled = scale >= 5;
    zoomOut.disabled = scale <= 1;
  };
  const fit = () => panzoom.reset({ animate: false });
  content.addEventListener('panzoomchange', update, options);
  zoomIn.addEventListener('click', () => panzoom.zoomIn({ animate: false }), options);
  zoomOut.addEventListener('click', () => panzoom.zoomOut({ animate: false }), options);
  reset.addEventListener('click', fit, options);
  stage.addEventListener('wheel', (event) => panzoom.zoomWithWheel(event, { animate: false }), { ...options, passive: false });
  stage.addEventListener('keydown', (event) => {
    const movement: Record<string, [number, number]> = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
    if (event.key === '+' || event.key === '=') panzoom.zoomIn({ animate: false });
    else if (event.key === '-') panzoom.zoomOut({ animate: false });
    else if (event.key === '0') fit();
    else if (movement[event.key]) panzoom.pan(...movement[event.key], { relative: true, animate: false });
    else return;
    event.preventDefault();
  }, options);
  let size = stage.getBoundingClientRect();
  const resize = new ResizeObserver(() => {
    const next = stage.getBoundingClientRect();
    if (next.width !== size.width || next.height !== size.height) fit();
    size = next;
  });
  resize.observe(stage);
  controls.disabled = false;
  update();
  return () => {
    events.abort();
    resize.disconnect();
    panzoom.destroy();
    panzoom.resetStyle();
    content.style.transform = '';
  };
};
