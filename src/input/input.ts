import { routePress, type PlayerIndex } from '../core/inputmap';

export interface PressEvent {
  type: 'press';
  player: PlayerIndex;
  source: 'keyboard' | 'pointer' | 'gamepad';
  key?: string;
  x?: number;
  y?: number;
}

export interface InputOptions {
  isDuel: () => boolean;
  onPress: (event: PressEvent) => void;
  onKey?: (key: string) => void;
  onGesture?: () => void;
  onActivity?: () => void;
}

export interface InputController {
  pollGamepads(): void;
  getHoldState(): readonly [boolean, boolean];
  destroy(): void;
}

const DEBOUNCE_MS = 80;

export function createInput(canvas: HTMLCanvasElement, options: InputOptions): InputController {
  const keyPlayers = new Map<string, PlayerIndex>();
  const heldPointers = new Map<number, PlayerIndex>();
  const heldGamepads: [boolean, boolean] = [false, false];
  const lastPress = [-Infinity, -Infinity];
  const pressedGamepadButtons = new Set<string>();
  const heldKeys = new Set<string>();
  let gestureStarted = false;

  const signalGesture = (): void => {
    if (gestureStarted) return;
    gestureStarted = true;
    options.onGesture?.();
  };

  const emit = (player: PlayerIndex, source: PressEvent['source'], key?: string, x?: number, y?: number): void => {
    const now = performance.now();
    if (now - lastPress[player] < DEBOUNCE_MS) return;
    lastPress[player] = now;
    options.onPress({
      type: 'press', player, source,
      ...(key ? { key } : {}),
      ...(x === undefined ? {} : { x }),
      ...(y === undefined ? {} : { y }),
    });
  };

  const keydown = (event: KeyboardEvent): void => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const token = event.key.toLowerCase();
    options.onActivity?.();
    signalGesture();
    if (heldKeys.has(token)) return;
    heldKeys.add(token);
    options.onKey?.(event.key);
    const player = routePress({ source: 'keyboard', key: event.key }, options.isDuel());
    if (player === null) return;
    event.preventDefault();
    keyPlayers.set(token, player);
    signalGesture();
    emit(player, 'keyboard', event.key);
  };

  const keyup = (event: KeyboardEvent): void => {
    const token = event.key.toLowerCase();
    heldKeys.delete(token);
    keyPlayers.delete(token);
  };

  const pointerdown = (event: PointerEvent): void => {
    options.onActivity?.();
    const bounds = canvas.getBoundingClientRect();
    signalGesture();
    const player = routePress({
      source: 'pointer',
      x: event.clientX - bounds.left,
      width: bounds.width,
    }, options.isDuel());
    if (player === null) return;
    event.preventDefault();
    heldPointers.set(event.pointerId, player);
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Capture is unavailable for some synthetic and browser-generated events.
    }
    signalGesture();
    emit(player, 'pointer', undefined, event.clientX - bounds.left, event.clientY - bounds.top);
  };

  const pointerup = (event: PointerEvent): void => {
    heldPointers.delete(event.pointerId);
  };

  const contextmenu = (event: Event): void => event.preventDefault();

  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  canvas.addEventListener('pointerdown', pointerdown);
  window.addEventListener('pointerup', pointerup);
  window.addEventListener('pointercancel', pointerup);
  canvas.addEventListener('contextmenu', contextmenu);

  return {
    pollGamepads(): void {
      const pads = navigator.getGamepads?.();
      const currentlyHeld: [boolean, boolean] = [false, false];
      if (!pads) {
        heldGamepads[0] = false;
        heldGamepads[1] = false;
        pressedGamepadButtons.clear();
        return;
      }
      for (let index = 0; index < pads.length; index += 1) {
        const pad = pads[index];
        if (!pad || !pad.connected) continue;
        const down = pad.buttons
          .map((button, buttonIndex) => button.pressed ? buttonIndex : -1)
          .filter((buttonIndex) => buttonIndex >= 0);
        if (down.length > 0) {
          options.onActivity?.();
          signalGesture();
        }
        const player = routePress({ source: 'gamepad', index, buttons: down }, options.isDuel());
        if (player === null) continue;
        currentlyHeld[player] = true;
        for (const buttonIndex of down.filter((button) => [0, 1, 2, 3, 9].includes(button))) {
          const buttonId = `${index}:${buttonIndex}`;
          if (pressedGamepadButtons.has(buttonId)) continue;
          pressedGamepadButtons.add(buttonId);
          signalGesture();
          emit(player, 'gamepad');
        }
      }
      for (const buttonId of pressedGamepadButtons) {
        const [padIndexText, buttonText] = buttonId.split(':');
        const pad = pads[Number(padIndexText)];
        if (!pad?.buttons[Number(buttonText)]?.pressed) pressedGamepadButtons.delete(buttonId);
      }
      heldGamepads[0] = currentlyHeld[0];
      heldGamepads[1] = currentlyHeld[1];
    },
    getHoldState(): readonly [boolean, boolean] {
      return [
        keyPlayersHas(0) || [...heldPointers.values()].includes(0) || heldGamepads[0],
        keyPlayersHas(1) || [...heldPointers.values()].includes(1) || heldGamepads[1],
      ];
    },
    destroy(): void {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      canvas.removeEventListener('pointerdown', pointerdown);
      window.removeEventListener('pointerup', pointerup);
      window.removeEventListener('pointercancel', pointerup);
      canvas.removeEventListener('contextmenu', contextmenu);
    },
  };

  function keyPlayersHas(player: PlayerIndex): boolean {
    return [...keyPlayers.values()].includes(player);
  }
}