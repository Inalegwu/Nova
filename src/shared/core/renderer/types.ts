import { Data, Schema } from 'effect';

// core types
export class ImageSource extends Data.TaggedClass('ImageSource')<{
  // url is more akin to filePath here
  url: string;
  width: number;
  height: number;
  metadata: Record<string, unknown>;
}> {}

export class AnimationState extends Data.TaggedClass('AnimationState')<{
  progress: number;
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
}> {}

export class RenderConfig extends Data.TaggedClass('RenderConfig')<{
  width: number;
  height: number;
  backgroundColor: string;
  preserveAspectRatio: boolean;
  scaleMode: 'contain' | 'cover' | 'stretch';
  filters: ImageFilter[];
}> {}

export class ImageFilter extends Data.TaggedClass('ImageFilter')<{
  type: 'brightness' | 'contrast' | 'saturation' | 'grayscale' | 'blur';
  value: number;
}> {}

export class AnimationConfig extends Data.TaggedClass('AnimationConfig')<{
  type: 'fade' | 'slide' | 'zoom' | 'crossfade' | 'dissolve';
  duration: number;
  easing: EasingFunction;
  direction: 'in' | 'out' | 'both';
}> {}

export type EasingFunction =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic';

// errors
export class ImageError extends Data.TaggedClass('ImageError')<{
  message: string;
  cause?: unknown;
}> {}

export class AnimationError extends Data.TaggedClass('AnimationError')<{
  message: string;
}> {}

export class CanvasError extends Data.TaggedClass('CanvasError')<{
  message: string;
}> {}

// schemas
export const ImageSourceSchema = Schema.Struct({
  url: Schema.String,
  width: Schema.Number.pipe(Schema.greaterThan(0)),
  height: Schema.Number.pipe(Schema.greaterThan(0)),
  metadata: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }).pipe(Schema.optional),
});

export const RenderConfigSchema = Schema.Struct({
  width: Schema.Number.pipe(Schema.between(100, 5000)),
  height: Schema.Number.pipe(Schema.between(100, 5000)),
  backgroundColor: Schema.String.pipe(
    Schema.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgba?\(/),
  ),
  preserveAspectRatio: Schema.Boolean,
  scaleMode: Schema.Literal('contain', 'cover', 'stretch'),
  filters: Schema.Array(
    Schema.Struct({
      type: Schema.Literal(
        'brightness',
        'contrast',
        'saturation',
        'grayscale',
        'blur',
      ),
      value: Schema.Number.pipe(Schema.between(0, 5)),
    }),
  ).pipe(Schema.maxItems(10)),
});
