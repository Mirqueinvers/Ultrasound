// src/hooks/useOrganVolume.ts
import { useEffect } from "react";

export interface UseOrganVolumeOptions {
  /** Текущие размеры (строки из формы) */
  length: string;
  width: string;
  depth: string;
  /** Текущее значение объёма (для сравнения, чтобы не писать лишний раз) */
  volume: string;
  /** Коэффициент эллипсоида: 0.523 (органы) | 0.479 (щитовидка) */
  coefficient?: number;
  /** Точность округления: 2 (по умолчанию) | 0 (мочевой пузырь) */
  precision?: number;
  /** Расчёт активен (Uterus: при «обычном» состоянии) */
  enabled?: boolean;
  /** Вызывается при изменении объёма (обычно commit или updateField) */
  onVolumeChange: (volume: string) => void;
}

/**
 * Авто-расчёт объёма эллипсоида: (L × W × D × coefficient) / 1000.
 * Выносит дублирующийся useEffect из 8 органов:
 *   Testis, ThyroidLobe, Uterus, Ovary, Prostate, UrinaryBladder, SalivaryGlands.
 *
 * Поведение:
 * - при валидных размерах (> 0) считает объём и вызывает onVolumeChange,
 *   если значение изменилось;
 * - при невалидных/disabled сбрасывает объём в "" (если был заполнен).
 */
export const useOrganVolume = ({
  length,
  width,
  depth,
  volume,
  coefficient = 0.523,
  precision = 2,
  enabled = true,
  onVolumeChange,
}: UseOrganVolumeOptions) => {
  useEffect(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);

    if (
      enabled &&
      !isNaN(l) && !isNaN(w) && !isNaN(d) &&
      l > 0 && w > 0 && d > 0
    ) {
      const next = ((l * w * d * coefficient) / 1000).toFixed(precision);
      if (next !== volume) {
        onVolumeChange(next);
      }
    } else if (volume !== "") {
      onVolumeChange("");
    }
    // onVolumeChange предполагается стабильным (commit/updateField из useOrganForm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, width, depth, volume, coefficient, precision, enabled]);
};