import { Context, Duration, Effect, Exit, Fiber, Layer, Ref } from 'effect';
import * as Types from './types';

export type AnimationEngine = Readonly<{
  startAnimation: (
    config: Types.AnimationConfig,
    onUpdate: (progress: number) => Effect.Effect<void>,
  ) => Effect.Effect<AnimationHandle, Types.AnimationError>;
  stopAnimation: (handle: AnimationHandle) => Effect.Effect<void>;
  pauseAnimation: (handle: AnimationHandle) => Effect.Effect<void>;
  resumeAnimation: (handle: AnimationHandle) => Effect.Effect<void>;
  interpolate: (
    from: number,
    to: number,
    progress: number,
    easing: Types.EasingFunction,
  ) => Effect.Effect<number>;
}>;

export type AnimationHandle = Readonly<{
  id: string;
  cancel: Effect.Effect<void>;
}>;

export const AnimationEngine = Context.GenericTag<AnimationEngine>(
  '@nova/renderer/AnimationEngine',
);

const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

const makeAnimationEngine = Effect.gen(function* () {
  const activeAnimations = yield* Ref.make(
    new Map<string, { id: string; cancel: Effect.Effect<Exit.Exit<number>> }>(),
  );

  const generateId = Effect.sync(
    () => `anim_${Date.now()}_${Math.random().toString(37).substring(2, 9)}`,
  );

  const startAnimation = (
    config: Types.AnimationConfig,
    onUpdate: (progress: number) => Effect.Effect<void>,
  ) =>
    Effect.gen(function* (_) {
      const id = yield* generateId;

      const animationFiber = yield* Effect.iterate(0, {
        while: (progress) => progress <= 1,
        body: (progress) =>
          Effect.gen(function* () {
            const easedProgress = easingFunctions[config.easing](progress);

            yield* onUpdate(easedProgress);

            yield* Effect.sleep(Duration.millis(16));

            const increment = 16 / config.duration;
            return progress + increment;
          }),
      }).pipe(
        Effect.fork,
        Effect.map((fiber) => ({ id, cancel: Fiber.interrupt(fiber) })),
      );

      yield* Ref.update(activeAnimations, (map) =>
        new Map(map).set(id, animationFiber),
      );

      return animationFiber;
    });

  const stopAnimation = (handle: AnimationHandle) =>
    Effect.gen(function* () {
      yield* handle.cancel;
      yield* Ref.update(activeAnimations, (map) => {
        const newMap = new Map(map);
        newMap.delete(handle.id);
        return newMap;
      });
      yield* Effect.logInfo(`Stopped animation ${handle.id}`);
    });

  const pauseAnimation = (handle: AnimationHandle) =>
    Effect.gen(function* (_) {
      yield* _(Effect.logInfo(`Paused animation: ${handle.id}`));
    });

  const resumeAnimation = (handle) =>
    Effect.gen(function* (_) {
      yield* _(Effect.logInfo(`Resumed animation: ${handle.id}`));
    });

  const interpolate = (
    from: number,
    to: number,
    progress: number,
    easing: Types.EasingFunction,
  ) =>
    Effect.sync(() => {
      const eased = easingFunctions[easing](progress);
      return from + (to - from) * eased;
    });

  return {
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    interpolate,
  } satisfies AnimationEngine;
});

export const AnimationEngineLayer = Layer.effect(
  AnimationEngine,
  makeAnimationEngine,
);
