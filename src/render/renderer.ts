import type { RoundSnapshot } from '../core/round';
import type { Block, DebrisPiece } from '../core/stack';
import type { LeaderboardEntry } from '../core/leaderboard';

export type AppScreen = 'attract' | 'countdown' | 'play' | 'game-over' | 'initials' | 'leaderboard';

export interface DebrisAnimation {
  piece: DebrisPiece;
  floor: number;
  age: number;
}

export interface ScoreBreakdown {
  floors: number;
  perfects: number;
  perfectBonus: number;
  layers: number;
  layerBonus: number;
  timeBonus: number;
  summitBonus: number;
}

export interface RendererScene {
  screen: AppScreen;
  round: RoundSnapshot;
  displayRound: RoundSnapshot;
  elapsed: number;
  debris: readonly DebrisAnimation[];
  perfectText: string;
  perfectAge: number;
  layerFlash: number;
  breakdown: ScoreBreakdown;
  leaderboard: readonly LeaderboardEntry[];
  leaderboardIndex: number;
  highlightedEntry: LeaderboardEntry | null;
  initials: string;
  holdProgress: number;
  muted: boolean;
}

interface Palette {
  top: string;
  bottom: string;
  glow: string;
}

const PALETTES: readonly Palette[] = [
  { top: '#34274f', bottom: '#ed8a74', glow: '#ffc394' },
  { top: '#62435e', bottom: '#f0a2a3', glow: '#ffe0c0' },
  { top: '#56769c', bottom: '#f5bc8b', glow: '#fff0bd' },
  { top: '#3e729c', bottom: '#b3d9e8', glow: '#ecfbff' },
  { top: '#23577e', bottom: '#86c6e2', glow: '#d9f5ff' },
  { top: '#263b75', bottom: '#a4b9de', glow: '#f0f7ff' },
  { top: '#171f4e', bottom: '#586eae', glow: '#cad8ff' },
  { top: '#172d60', bottom: '#51b9bb', glow: '#d5ffe8' },
  { top: '#483b83', bottom: '#f4c783', glow: '#fff4bd' },
];

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private width = 1;
  private height = 1;
  private camera = 0;
  private lastDpr = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is not available.');
    this.context = context;
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  destroy(): void {
    window.removeEventListener('resize', this.resize);
  }

  render(scene: RendererScene, dt: number): void {
    this.resize();
    const minSide = Math.min(this.width, this.height);
    const round = scene.screen === 'attract' ? scene.displayRound : scene.round;
    const layerIndex = Math.max(0, Math.min(8, round.layer - 1));
    const palette = PALETTES[layerIndex]!;
    const blockHeight = Math.max(16, minSide * 0.045);
    const contentWidth = this.width * 0.84;
    const contentLeft = this.width * 0.08;
    const ground = this.height * 0.89;
    const targetCamera = Math.max(0, round.floors * blockHeight - this.height * 0.3);
    this.camera += (targetCamera - this.camera) * (1 - Math.exp(-Math.max(0, dt) * 2.4));

    this.drawSky(palette, round.layer, scene.elapsed);
    this.drawClouds(scene.elapsed);
    if (round.layer >= 7) this.drawStars(scene.elapsed, palette.glow);

    for (let index = 0; index < round.blocks.length; index += 1) {
      const block = round.blocks[index]!;
      this.drawBlock(block, index, contentLeft, contentWidth, ground, blockHeight, minSide);
    }
    if (round.movingBlock && (scene.screen === 'play' || scene.screen === 'countdown' || scene.screen === 'attract')) {
      this.drawBlock(
        round.movingBlock,
        round.floors + 1,
        contentLeft,
        contentWidth,
        ground,
        blockHeight,
        minSide,
        true,
      );
    }
    this.drawDebris(scene.debris, contentLeft, contentWidth, ground, blockHeight);
    this.drawHud(round, scene, minSide);
    this.drawLayerPips(round, minSide);

    if (scene.perfectAge >= 0 && scene.perfectAge < 1.15) this.drawPerfect(scene, minSide);
    if (scene.layerFlash > 0) this.drawLayerBanner(round, scene, minSide);
    this.drawScreen(scene, minSide);
  }

  private resize = (): void => {
    const bounds = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    this.width = Math.max(1, bounds.width || window.innerWidth);
    this.height = Math.max(1, bounds.height || window.innerHeight);
    if (dpr === this.lastDpr && this.canvas.width === Math.round(this.width * dpr)
      && this.canvas.height === Math.round(this.height * dpr)) return;
    this.lastDpr = dpr;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private drawSky(palette: Palette, layer: number, elapsed: number): void {
    const ctx = this.context;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, palette.top);
    gradient.addColorStop(0.58, palette.bottom);
    gradient.addColorStop(1, layer === 9 ? '#fbe6ae' : palette.glow);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    const glowX = this.width * (0.72 + Math.sin(elapsed * 0.08) * 0.04);
    const glow = ctx.createRadialGradient(glowX, this.height * 0.52, 0, glowX, this.height * 0.52, this.width * 0.55);
    glow.addColorStop(0, `${palette.glow}55`);
    glow.addColorStop(1, `${palette.glow}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.width, this.height);

    if (layer === 1) this.drawCitySilhouette();
  }

  private drawCitySilhouette(): void {
    const ctx = this.context;
    const baseY = this.height * 0.88;
    ctx.fillStyle = '#20274799';
    const buildings = 22;
    for (let index = 0; index < buildings; index += 1) {
      const width = this.width / buildings + 1;
      const height = this.height * (0.035 + ((index * 37) % 80) / 1000);
      ctx.fillRect(index * width, baseY - height, width, height);
      if (index % 3 === 0) {
        ctx.fillStyle = '#ffd8a966';
        ctx.fillRect(index * width + width * 0.35, baseY - height * 0.72, 3, 5);
        ctx.fillStyle = '#20274799';
      }
    }
  }

  private drawClouds(elapsed: number): void {
    const bands = [
      { y: 0.3, scale: 0.7, speed: 5, opacity: 0.13, size: 0.19 },
      { y: 0.48, scale: 1, speed: 11, opacity: 0.2, size: 0.25 },
      { y: 0.69, scale: 1.4, speed: 18, opacity: 0.25, size: 0.32 },
    ];
    for (const [bandIndex, band] of bands.entries()) {
      const spacing = this.width * band.size;
      const shift = (elapsed * band.speed * band.scale) % spacing;
      for (let index = -1; index < Math.ceil(this.width / spacing) + 1; index += 1) {
        const x = index * spacing - shift + spacing * 0.5;
        const y = this.height * band.y + Math.sin(index * 2.3 + bandIndex) * this.height * 0.018;
        this.drawCloud(x, y, spacing * 0.8, this.height * 0.055 * band.scale, band.opacity);
      }
    }
  }

  private drawCloud(x: number, y: number, width: number, height: number, opacity: number): void {
    const ctx = this.context;
    ctx.save();
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.beginPath();
    ctx.ellipse(x, y, width * 0.48, height * 0.38, 0, 0, Math.PI * 2);
    ctx.ellipse(x - width * 0.2, y + height * 0.08, width * 0.25, height * 0.35, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.16, y - height * 0.1, width * 0.28, height * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawStars(elapsed: number, color: string): void {
    const ctx = this.context;
    for (let index = 0; index < 70; index += 1) {
      const x = ((index * 97.31) % 997) / 997 * this.width;
      const y = ((index * 61.77) % 991) / 991 * this.height * 0.66;
      const alpha = 0.35 + (Math.sin(elapsed * 2 + index) + 1) * 0.3;
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, index % 9 === 0 ? 2 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawBlock(
    block: Block,
    floor: number,
    left: number,
    width: number,
    ground: number,
    blockHeight: number,
    minSide: number,
    moving = false,
  ): void {
    const x = left + block.x / 100 * width;
    const slabWidth = block.width / 100 * width;
    const y = ground - floor * blockHeight + this.camera;
    if (y < -blockHeight * 2 || y > this.height + blockHeight) return;
    const hue = (190 + floor * 19) % 360;
    const radius = Math.max(3, minSide * 0.008);
    const sideDepth = Math.max(4, blockHeight * 0.16);
    const ctx = this.context;
    ctx.save();
    if (moving) ctx.shadowColor = `hsla(${hue},90%,75%,0.6)`;
    ctx.shadowBlur = moving ? minSide * 0.025 : minSide * 0.008;
    ctx.fillStyle = `hsl(${hue} 72% 34%)`;
    ctx.beginPath();
    ctx.moveTo(x + radius, y + blockHeight - sideDepth);
    ctx.lineTo(x + slabWidth - radius, y + blockHeight - sideDepth);
    ctx.lineTo(x + slabWidth, y + blockHeight);
    ctx.lineTo(x, y + blockHeight);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = `hsl(${hue} 76% 53%)`;
    this.roundRect(x, y, slabWidth, blockHeight - sideDepth, radius);
    ctx.fill();
    ctx.fillStyle = `hsl(${hue} 87% 77% / 0.7)`;
    ctx.fillRect(x + radius, y + 2, Math.max(0, slabWidth - radius * 2), Math.max(2, blockHeight * 0.09));
    ctx.restore();
  }

  private drawDebris(
    debris: readonly DebrisAnimation[],
    left: number,
    width: number,
    ground: number,
    blockHeight: number,
  ): void {
    const ctx = this.context;
    for (const item of debris) {
      const { piece, age, floor } = item;
      if (age > 1.4) continue;
      const rotation = (piece.side === 'left' ? -1 : 1) * age * 5;
      const x = left + (piece.x + piece.width / 2) / 100 * width;
      const y = ground - floor * blockHeight + this.camera + age * age * this.height * 0.7;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = Math.max(0, 1 - age / 1.4);
      ctx.fillStyle = `hsl(${(190 + floor * 19) % 360} 75% 48%)`;
      ctx.fillRect(-piece.width / 200 * width, 0, piece.width / 100 * width, blockHeight * 0.8);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  private drawHud(round: RoundSnapshot, scene: RendererScene, minSide: number): void {
    const ctx = this.context;
    const labelSize = Math.max(16, minSide * 0.04);
    const scoreSize = Math.max(27, minSide * 0.075);
    this.text(`SCORE  ${round.score.toLocaleString()}`, this.width * 0.055, this.height * 0.1, scoreSize, 'left');
    this.text(`FLOORS  ${round.floors}`, this.width * 0.055, this.height * 0.1 + labelSize * 1.35, labelSize, 'left');
    this.text(`LAYER ${round.layer} · ${round.layerName.toUpperCase()}`, this.width * 0.055, this.height * 0.1 + labelSize * 2.65, labelSize, 'left');

    const radius = Math.max(25, minSide * 0.075);
    const centerX = this.width - radius * 1.45;
    const centerY = radius * 1.4;
    const fraction = Math.max(0, Math.min(1, round.timeRemaining / 60));
    const warning = round.timeRemaining <= 10;
    ctx.lineWidth = Math.max(5, minSide * 0.009);
    ctx.strokeStyle = '#14203d99';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = warning ? '#ff786f' : '#f7f5df';
    if (warning) ctx.globalAlpha = 0.65 + (Math.sin(scene.elapsed * 9) + 1) * 0.17;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
    ctx.stroke();
    ctx.globalAlpha = 1;
    this.text(`${Math.ceil(round.timeRemaining)}`, centerX, centerY + minSide * 0.015, labelSize * 1.15, 'center');
    this.text(scene.muted ? 'SOUND OFF · M' : 'SOUND ON · M', this.width - 18, this.height - 18, Math.max(13, labelSize * 0.7), 'right');
  }

  private drawLayerPips(round: RoundSnapshot, minSide: number): void {
    const ctx = this.context;
    const pipGap = Math.min(14, this.width * 0.012);
    const pipWidth = Math.min(44, (this.width * 0.62 - pipGap * 8) / 9);
    const total = pipWidth * 9 + pipGap * 8;
    const left = (this.width - total) / 2;
    const y = this.height - Math.max(25, minSide * 0.055);
    const active = round.layer - 1;
    for (let index = 0; index < 9; index += 1) {
      const progress = index < active ? 1 : index === active ? (round.floors % 6) / 6 : 0;
      ctx.fillStyle = '#13213c99';
      ctx.fillRect(left + index * (pipWidth + pipGap), y, pipWidth, Math.max(7, minSide * 0.012));
      ctx.fillStyle = index < active ? '#f6f1dc' : '#a9e3ed';
      ctx.fillRect(left + index * (pipWidth + pipGap), y, pipWidth * progress, Math.max(7, minSide * 0.012));
    }
  }

  private drawPerfect(scene: RendererScene, minSide: number): void {
    const ctx = this.context;
    const progress = scene.perfectAge / 1.15;
    const radius = minSide * (0.08 + progress * 0.27);
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = '#fff4b8';
    ctx.lineWidth = Math.max(3, minSide * 0.006);
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height * 0.43, radius, 0, Math.PI * 2);
    ctx.stroke();
    this.text(scene.perfectText, this.width / 2, this.height * 0.39, Math.max(23, minSide * 0.07), 'center', '#fff2b0');
    ctx.restore();
  }

  private drawLayerBanner(round: RoundSnapshot, scene: RendererScene, minSide: number): void {
    const ctx = this.context;
    const alpha = Math.min(0.88, scene.layerFlash * 1.4);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#162344';
    ctx.fillRect(0, this.height * 0.39, this.width, this.height * 0.18);
    this.text(`LAYER ${round.layer}: ${round.layerName.toUpperCase()}`, this.width / 2, this.height * 0.49, Math.max(22, minSide * 0.062), 'center', '#fff8db');
    ctx.restore();
  }

  private drawScreen(scene: RendererScene, minSide: number): void {
    const ctx = this.context;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const big = Math.max(36, minSide * 0.105);
    const medium = Math.max(20, minSide * 0.047);
    if (scene.screen === 'play') return;

    ctx.save();
    ctx.fillStyle = scene.screen === 'attract' ? '#111a3470' : '#111a34bd';
    ctx.fillRect(0, 0, this.width, this.height);

    if (scene.screen === 'attract') {
      this.text('SKYLINE STACK', centerX, centerY - minSide * 0.12, big, 'center', '#fff8e4');
      this.text('Stack to Cloud Nine', centerX, centerY - minSide * 0.02, medium, 'center', '#d2f3ff');
      const blink = Math.sin(scene.elapsed * 3.2) > -0.15;
      if (blink) this.text('TAP / PRESS ANY BUTTON', centerX, centerY + minSide * 0.1, medium, 'center', '#ffe8a6');
      this.text('60 SECONDS · ONE BUTTON · NINE LAYERS', centerX, this.height * 0.91, Math.max(13, medium * 0.62), 'center', '#ffffff');
      this.drawLeaderboard(scene, minSide, centerY + minSide * 0.24, false);
    } else if (scene.screen === 'countdown') {
      const countdown = Math.max(1, Math.ceil(scene.round.countdownRemaining));
      this.text(countdown.toString(), centerX, centerY + big * 0.35, big * 2.2, 'center', '#fff5ce');
      this.text('GET READY', centerX, centerY + big * 1.25, medium, 'center');
    } else if (scene.screen === 'game-over') {
      this.text('TOWER COMPLETE', centerX, centerY - minSide * 0.29, big * 0.75, 'center', '#fff5ce');
      const reason = scene.round.endReason === 'missed' ? 'THE BLOCK SLIPPED AWAY' : 'TIME IS UP';
      this.text(reason, centerX, centerY - minSide * 0.21, medium, 'center', '#d8edff');
      this.text(`SCORE  ${scene.round.score.toLocaleString()}`, centerX, centerY - minSide * 0.11, big, 'center');
      const rows = [
        `FLOORS  ${scene.breakdown.floors}  ·  PERFECTS  ${scene.breakdown.perfects}  +${scene.breakdown.perfectBonus}`,
        `LAYERS  ${scene.breakdown.layers}  +${scene.breakdown.layerBonus}  ·  TIME  +${scene.breakdown.timeBonus}`,
        ...(scene.breakdown.summitBonus > 0 ? [`CLOUD NINE BONUS  +${scene.breakdown.summitBonus}`] : []),
      ];
      rows.forEach((row, index) => this.text(row, centerX, centerY + minSide * (index * 0.065), Math.max(15, medium * 0.78), 'center'));
      this.text('PRESS TO CONTINUE', centerX, centerY + minSide * 0.23, medium * 0.8, 'center', '#ffe8a6');
    } else if (scene.screen === 'initials') {
      this.text('NEW HIGH SCORE', centerX, centerY - minSide * 0.15, big * 0.82, 'center', '#fff2ac');
      this.text(scene.initials.split('').join('  '), centerX, centerY + minSide * 0.01, big * 1.35, 'center');
      this.text('TAP: NEXT LETTER', centerX, centerY + minSide * 0.13, medium * 0.8, 'center');
      const holdWidth = this.width * 0.42;
      ctx.fillStyle = '#ffffff55';
      ctx.fillRect(centerX - holdWidth / 2, centerY + minSide * 0.17, holdWidth, 8);
      ctx.fillStyle = '#ffe8a6';
      ctx.fillRect(centerX - holdWidth / 2, centerY + minSide * 0.17, holdWidth * scene.holdProgress, 8);
      this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.24, Math.max(14, medium * 0.68), 'center');
    } else if (scene.screen === 'leaderboard') {
      this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.31, big * 0.76, 'center', '#fff2ac');
      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.22, true);
      this.text('PRESS TO PLAY AGAIN', centerX, this.height - minSide * 0.12, medium * 0.82, 'center', '#ffe8a6');
    }
    ctx.restore();
  }

  private drawLeaderboard(scene: RendererScene, minSide: number, startY: number, full: boolean): void {
    const ctx = this.context;
    if (!scene.leaderboard.length) {
      this.text('BE THE FIRST ON THE BOARD', this.width / 2, startY + minSide * 0.035, Math.max(14, minSide * 0.035), 'center');
      return;
    }
    const count = full ? Math.min(10, scene.leaderboard.length) : 1;
    const index = full ? 0 : scene.leaderboardIndex % scene.leaderboard.length;
    for (let row = 0; row < count; row += 1) {
      const entryIndex = full ? row : index;
      const entry = scene.leaderboard[entryIndex]!;
      const y = startY + row * minSide * 0.06;
      const highlighted = scene.highlightedEntry?.initials === entry.initials
        && scene.highlightedEntry.score === entry.score;
      ctx.fillStyle = highlighted ? '#f5d477' : '#ffffffdd';
      this.text(`${String(entryIndex + 1).padStart(2, '0')}   ${entry.initials}   ${entry.score.toLocaleString()}`, this.width / 2, y, Math.max(15, minSide * (full ? 0.034 : 0.04)), 'center', highlighted ? '#ffe89b' : '#ffffff');
    }
  }

  private text(
    value: string,
    x: number,
    y: number,
    size: number,
    align: CanvasTextAlign,
    color = '#ffffff',
  ): void {
    const ctx = this.context;
    ctx.save();
    ctx.font = `800 ${size}px system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, size * 0.13);
    ctx.strokeStyle = '#111a35';
    ctx.strokeText(value, x, y, this.width * 0.9);
    ctx.fillStyle = color;
    ctx.fillText(value, x, y, this.width * 0.9);
    ctx.restore();
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    const ctx = this.context;
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(0, width), Math.max(0, height), radius);
  }
}