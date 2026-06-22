// Minimal ambient declaration for gif.js (no official types).
declare module "gif.js" {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    transparent?: number | null;
    repeat?: number;
    background?: string;
    dither?: boolean | string;
  }
  interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }
  export default class GIF {
    constructor(options?: GIFOptions);
    addFrame(
      image: CanvasImageSource | CanvasRenderingContext2D,
      options?: AddFrameOptions
    ): void;
    on(event: "finished", cb: (blob: Blob) => void): void;
    on(event: "progress", cb: (p: number) => void): void;
    on(event: string, cb: (...args: unknown[]) => void): void;
    render(): void;
    abort(): void;
  }
}
