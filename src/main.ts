const canvas = document.querySelector<HTMLCanvasElement>('#game');

if (!canvas) {
  throw new Error('The game canvas is missing.');
}