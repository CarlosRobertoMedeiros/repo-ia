const DEFAULT_FALLBACK_COLOR = '#0f766e';

export function normalizeHexColor(color?: string | null, fallback = DEFAULT_FALLBACK_COLOR): string {
  const normalizedColor = color?.trim();

  if (!normalizedColor) {
    return fallback;
  }

  const value = normalizedColor.replace('#', '');

  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value
      .split('')
      .map((character) => `${character}${character}`)
      .join('')
      .toLowerCase()}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(value)) {
    return `#${value.toLowerCase()}`;
  }

  return fallback;
}

export function hexToRgb(color: string, fallback = DEFAULT_FALLBACK_COLOR) {
  const normalizedColor = normalizeHexColor(color, fallback).replace('#', '');

  return {
    red: Number.parseInt(normalizedColor.slice(0, 2), 16),
    green: Number.parseInt(normalizedColor.slice(2, 4), 16),
    blue: Number.parseInt(normalizedColor.slice(4, 6), 16),
  };
}

export function mixHexColors(baseColor: string, mixColor: string, weight: number): string {
  const base = hexToRgb(baseColor);
  const mix = hexToRgb(mixColor);
  const safeWeight = Math.min(Math.max(weight, 0), 1);

  const blendChannel = (baseChannel: number, mixChannel: number) =>
    Math.round(baseChannel * (1 - safeWeight) + mixChannel * safeWeight);

  const red = blendChannel(base.red, mix.red).toString(16).padStart(2, '0');
  const green = blendChannel(base.green, mix.green).toString(16).padStart(2, '0');
  const blue = blendChannel(base.blue, mix.blue).toString(16).padStart(2, '0');

  return `#${red}${green}${blue}`;
}

export function withAlpha(color: string, alpha: number): string {
  const { red, green, blue } = hexToRgb(color);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getColorLuminance(color: string): number {
  const { red, green, blue } = hexToRgb(color);
  return (red * 299 + green * 587 + blue * 114) / 1000;
}

export function isLightColor(color: string, threshold = 168): boolean {
  return getColorLuminance(color) >= threshold;
}

export function ensureReadableDarkColor(
  color?: string | null,
  options?: {
    fallback?: string;
    threshold?: number;
    darkenWeight?: number;
    darkMixColor?: string;
  },
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK_COLOR;
  const threshold = options?.threshold ?? 168;
  const darkenWeight = options?.darkenWeight ?? 0.22;
  const darkMixColor = options?.darkMixColor ?? '#020617';
  const normalizedColor = normalizeHexColor(color, fallback);

  if (!isLightColor(normalizedColor, threshold)) {
    return normalizedColor;
  }

  return mixHexColors(normalizedColor, darkMixColor, darkenWeight);
}
