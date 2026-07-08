import { memo } from "react";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { AppStyles } from "../../styles/appStyles";

type ThyroidAutoIndicatorsProps = {
  styles: AppStyles;
  totalVolume: string;
  rightToLeftRatio: string;
};

export const ThyroidAutoIndicators = memo(function ThyroidAutoIndicators({
  styles,
  totalVolume,
  rightToLeftRatio,
}: ThyroidAutoIndicatorsProps) {
  return (
    <>
      <ProtocolFieldRow
        label="Общий объем (мл)"
        value={totalVolume || "Рассчитывается автоматически"}
        typeLabel="auto"
        filled={Boolean(totalVolume)}
        readonly
      />
      <ProtocolFieldRow
        label="Соотношение долей"
        value={rightToLeftRatio || "Рассчитывается автоматически"}
        typeLabel="auto"
        filled={Boolean(rightToLeftRatio)}
        readonly
      />
    </>
  );
});
