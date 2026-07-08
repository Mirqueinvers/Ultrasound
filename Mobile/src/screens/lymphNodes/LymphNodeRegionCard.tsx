import { Text, View } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { LymphNodeRegionDraft } from "../../shared/lymphNodesDraft";
import type { AppStyles } from "../../styles/appStyles";
import {
  DETECTION_OPTIONS,
  type EditorState,
} from "./lymphNodesFieldConfigs";
import { LymphNodeCard } from "./LymphNodeCard";

import type { LymphNodeDraft, LymphNodesDraft } from "../../shared/lymphNodesDraft";

type LymphNodeRegionCardProps = {
  styles: AppStyles;
  regionKey: keyof LymphNodesDraft;
  title: string;
  region: LymphNodeRegionDraft;
  fv: Record<string, boolean>;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateRegionField: (regionKey: keyof LymphNodesDraft, field: keyof LymphNodeRegionDraft, value: string) => void;
  onAddNode: (regionKey: keyof LymphNodesDraft, side: "left" | "right") => void;
  onUpdateNodeField: (regionKey: keyof LymphNodesDraft, index: number, field: keyof LymphNodeDraft, value: string) => void;
  onRemoveNode: (regionKey: keyof LymphNodesDraft, index: number) => void;
};

export function LymphNodeRegionCard({
  styles,
  regionKey,
  title,
  region,
  fv,
  openEditor,
  onUpdateRegionField,
  onAddNode,
  onUpdateNodeField,
  onRemoveNode,
}: LymphNodeRegionCardProps) {
  return (
    <ProtocolCard title={title} key={regionKey}>
      <View style={styles.obpFieldList}>
        <ProtocolFieldRow
          label="Определение"
          value={region.detected === "detected" ? "Определяются" : "Не определяются"}
          typeLabel="select"
          filled={region.detected === "detected"}
          options={DETECTION_OPTIONS}
          onSelectOption={(nextValue) =>
            onUpdateRegionField(regionKey, "detected", nextValue)
          }
        />

        {region.detected === "detected" && (
          <View style={styles.obpFieldList}>
            {region.nodes.length === 0 ? (
              <Text style={styles.helperText}>Лимфатические узлы не добавлены</Text>
            ) : (
              region.nodes.map((node, index) => (
                <LymphNodeCard
                  key={`${regionKey}-node-${node.id || index}`}
                  styles={styles}
                  regionKey={regionKey}
                  node={node}
                  index={index}
                  fv={fv}
                  openEditor={openEditor}
                  onUpdateNodeField={onUpdateNodeField}
                  onRemoveNode={onRemoveNode}
                />
              ))
            )}

            <View style={styles.dualRow}>
              <View style={styles.dualCol}>
                <ProtocolActionButton
                  label="+ Правый узел"
                  onPress={() => onAddNode(regionKey, "right")}
                />
              </View>
              <View style={styles.dualCol}>
                <ProtocolActionButton
                  label="+ Левый узел"
                  onPress={() => onAddNode(regionKey, "left")}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </ProtocolCard>
  );
}
