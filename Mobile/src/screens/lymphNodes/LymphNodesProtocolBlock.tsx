import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import {
  FieldEditorModal,
  type FieldEditorOption,
} from "../../components/FieldEditorModal";
import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import {
  ProtocolOrganHeader,
  ProtocolSectionHeader,
} from "../../components/protocol/ProtocolHeaders";
import {
  createEmptyLymphNodeDraft,
  type LymphNodeDraft,
  type LymphNodeRegionDraft,
  type LymphNodesStudyDraft,
} from "../../shared/lymphNodesDraft";
import type { AppStyles } from "../../styles/appStyles";

type EditorState = {
  title: string;
  mode: "number" | "select" | "text";
  value: string;
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  footerContent?: (context: {
    value: string;
    setValue: (nextValue: string) => void;
    close: () => void;
  }) => ReactNode;
  onSave: (value: string) => void;
} | null;

type LymphNodesProtocolBlockProps = {
  styles: AppStyles;
  value: LymphNodesStudyDraft;
  onChange: (value: LymphNodesStudyDraft) => void;
};

const REGION_FIELDS = [
  { key: "submandibular" as const, title: "Поднижнечелюстные" },
  { key: "cervical" as const, title: "Шейные" },
  { key: "subclavian" as const, title: "Подключичные" },
  { key: "supraclavicular" as const, title: "Надключичные" },
  { key: "axillary" as const, title: "Подмышечные" },
  { key: "inguinal" as const, title: "Паховые" },
];

const DETECTION_OPTIONS: FieldEditorOption[] = [
  { value: "not_detected", label: "Не определяются" },
  { value: "detected", label: "Определяются" },
];

const LYMPH_NODE_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "изоэхогенный", label: "изоэхогенный" },
  { value: "гипоэхогенный", label: "гипоэхогенный" },
];

const LYMPH_NODE_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "однородная" },
  { value: "неоднородная", label: "неоднородная" },
];

const LYMPH_NODE_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "овальная", label: "овальная" },
  { value: "округлая", label: "округлая" },
];

const LYMPH_NODE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "ровный четкий", label: "ровный четкий" },
  { value: "нечеткий", label: "нечеткий" },
  { value: "неровный", label: "неровный" },
];

const LYMPH_NODE_BLOOD_FLOW_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "не определяется" },
  { value: "сохранен", label: "сохранен" },
];

export function LymphNodesProtocolBlock({ styles, value, onChange }: LymphNodesProtocolBlockProps) {
  const [form, setForm] = useState<LymphNodesStudyDraft>(value);
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value);
  }, [value]);

  const lymphNodes = form.lymphNodes;

  const updateForm = (updater: (current: LymphNodesStudyDraft) => LymphNodesStudyDraft) => {
    setForm((current) => {
      const next = updater(current);
      onChange(next);
      return next;
    });
  };

  const openEditor = (config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    setTimeout(() => {
      setEditorState(config);
    }, 0);
  };

  const closeEditor = () => setEditorState(null);

  const saveEditor = (nextValue: string) => {
    editorState?.onSave(nextValue);
    closeEditor();
  };

  const updateRegionField = (
    regionKey: keyof LymphNodesStudyDraft["lymphNodes"],
    field: keyof LymphNodeRegionDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const sourceRegion = current.lymphNodes[regionKey];
      const nextRegion: LymphNodeRegionDraft = {
        ...sourceRegion,
        [field]: nextValue,
      };

      if (field === "detected" && nextValue === "not_detected") {
        nextRegion.nodes = [];
      }

      return {
        ...current,
        lymphNodes: {
          ...current.lymphNodes,
          [regionKey]: nextRegion,
        },
      };
    });
  };

  const addNode = (regionKey: keyof LymphNodesStudyDraft["lymphNodes"], side: "left" | "right") => {
    updateForm((current) => {
      const sourceRegion = current.lymphNodes[regionKey];
      const nextNode: LymphNodeDraft = {
        ...createEmptyLymphNodeDraft(),
        id: `${Date.now()}-${Math.random()}`,
        side,
      };

      return {
        ...current,
        lymphNodes: {
          ...current.lymphNodes,
          [regionKey]: {
            ...sourceRegion,
            detected: "detected",
            nodes: [...sourceRegion.nodes, nextNode],
          },
        },
      };
    });
  };

  const updateNodeField = (
    regionKey: keyof LymphNodesStudyDraft["lymphNodes"],
    index: number,
    field: keyof LymphNodeDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const sourceRegion = current.lymphNodes[regionKey];
      const nextNodes = sourceRegion.nodes.map((node, nodeIndex) =>
        nodeIndex === index ? { ...node, [field]: nextValue } : node,
      );

      return {
        ...current,
        lymphNodes: {
          ...current.lymphNodes,
          [regionKey]: {
            ...sourceRegion,
            nodes: nextNodes,
          },
        },
      };
    });
  };

  const removeNode = (regionKey: keyof LymphNodesStudyDraft["lymphNodes"], index: number) => {
    updateForm((current) => {
      const sourceRegion = current.lymphNodes[regionKey];
      const nextNodes = sourceRegion.nodes.filter((_, nodeIndex) => nodeIndex !== index);

      return {
        ...current,
        lymphNodes: {
          ...current.lymphNodes,
          [regionKey]: {
            ...sourceRegion,
            nodes: nextNodes,
          },
        },
      };
    });
  };

  const renderField = (
    label: string,
    valueText: string,
    typeLabel: "numpad" | "select" | "text" | "auto",
    filled: boolean,
    onPress?: () => void,
    readonly?: boolean,
  options?: FieldEditorOption[],
    onSelectOption?: (value: string) => void,
  ) => (
    <ProtocolFieldRow
      label={label}
      value={valueText}
      typeLabel={typeLabel}
      filled={filled}
      readonly={readonly}
      onPress={onPress}
      options={options}
      onSelectOption={onSelectOption}
    />
  );

  const renderNode = (
    regionKey: keyof LymphNodesStudyDraft["lymphNodes"],
    node: LymphNodeDraft,
    index: number,
  ) => (
    <ProtocolCard
      key={`${regionKey}-node-${node.id || index}`}
      title={`Узел ${node.side === "right" ? "правый" : "левый"}`}
      actionLabel="Удалить"
      actionVariant="danger"
      onActionPress={() => removeNode(regionKey, index)}
      variant="item"
    >
      <View style={styles.obpFieldList}>
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            {renderField(
              "Размер 1 (мм)",
              node.size1 || "Введите размер",
              "numpad",
              Boolean(node.size1),
              () =>
                openEditor({
                  title: `Узел #${index + 1}: Размер 1`,
                  mode: "number",
                  value: node.size1,
                  placeholder: "мм",
                  onSave: (nextValue) => updateNodeField(regionKey, index, "size1", nextValue),
                }),
            )}
          </View>
          <View style={styles.dualCol}>
            {renderField(
              "Размер 2 (мм)",
              node.size2 || "Введите размер",
              "numpad",
              Boolean(node.size2),
              () =>
                openEditor({
                  title: `Узел #${index + 1}: Размер 2`,
                  mode: "number",
                  value: node.size2,
                  placeholder: "мм",
                  onSave: (nextValue) => updateNodeField(regionKey, index, "size2", nextValue),
                }),
            )}
          </View>
        </View>

        {renderField(
          "Эхогенность",
          node.echogenicity || "Введите значение",
          "select",
          Boolean(node.echogenicity),
          undefined,
          undefined,
          LYMPH_NODE_ECHOGENICITY_OPTIONS,
          (nextValue) => updateNodeField(regionKey, index, "echogenicity", nextValue),
        )}

        {renderField(
          "Эхоструктура",
          node.echostructure || "Введите значение",
          "select",
          Boolean(node.echostructure),
          undefined,
          undefined,
          LYMPH_NODE_ECHOSTRUCTURE_OPTIONS,
          (nextValue) => updateNodeField(regionKey, index, "echostructure", nextValue),
        )}

        {renderField(
          "Форма",
          node.shape || "Введите значение",
          "select",
          Boolean(node.shape),
          undefined,
          undefined,
          LYMPH_NODE_SHAPE_OPTIONS,
          (nextValue) => updateNodeField(regionKey, index, "shape", nextValue),
        )}

        {renderField(
          "Контур",
          node.contour || "Введите значение",
          "select",
          Boolean(node.contour),
          undefined,
          undefined,
          LYMPH_NODE_CONTOUR_OPTIONS,
          (nextValue) => updateNodeField(regionKey, index, "contour", nextValue),
        )}

        {renderField(
          "Кровоток",
          node.bloodFlow || "Введите значение",
          "select",
          Boolean(node.bloodFlow),
          undefined,
          undefined,
          LYMPH_NODE_BLOOD_FLOW_OPTIONS,
          (nextValue) => updateNodeField(regionKey, index, "bloodFlow", nextValue),
        )}
      </View>
    </ProtocolCard>
  );

  const renderRegion = (
    regionKey: keyof LymphNodesStudyDraft["lymphNodes"],
    title: string,
  ) => {
    const region = lymphNodes[regionKey];

    return (
      <ProtocolCard title={title} key={regionKey}>
        <View style={styles.obpFieldList}>
          {renderField(
          "Определение",
          region.detected === "detected" ? "Определяются" : "Не определяются",
          "select",
          region.detected === "detected",
          undefined,
          undefined,
          DETECTION_OPTIONS,
          (nextValue) =>
                  updateRegionField(regionKey, "detected", nextValue as LymphNodeRegionDraft["detected"]),
        )}

          {region.detected === "detected" && (
            <View style={styles.obpFieldList}>
              {region.nodes.length === 0 ? (
                <Text style={styles.helperText}>Лимфатические узлы не добавлены</Text>
              ) : (
                region.nodes.map((node, index) => renderNode(regionKey, node, index))
              )}

              <View style={styles.dualRow}>
                <View style={styles.dualCol}>
                  <ProtocolActionButton
                    label="+ Правый узел"
                    onPress={() => addNode(regionKey, "right")}
                  />
                </View>
                <View style={styles.dualCol}>
                  <ProtocolActionButton
                    label="+ Левый узел"
                    onPress={() => addNode(regionKey, "left")}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </ProtocolCard>
    );
  };

  return (
    <>
      <FieldEditorModal
        visible={Boolean(editorState)}
        title={editorState?.title ?? ""}
        mode={editorState?.mode ?? "text"}
        value={editorState?.value ?? ""}
        options={editorState?.options}
        placeholder={editorState?.placeholder}
        multiline={editorState?.multiline}
        footerContent={editorState?.footerContent}
        onCancel={closeEditor}
        onSave={saveEditor}
      />

      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Лимфатические узлы" />
      </View>

      {REGION_FIELDS.map(({ key, title }) => (
        <View key={key} style={styles.kidneyPlainSection}>
          {renderRegion(key, title)}
        </View>
      ))}

      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Заключение" />
        <View style={styles.obpFieldList}>
          {renderField(
            "Заключение",
            form.conclusion || "Введите заключение",
            "text",
            Boolean(form.conclusion),
            () =>
              openEditor({
                title: "Заключение лимфоузлов",
                mode: "text",
                value: form.conclusion,
                placeholder: "Введите заключение",
                multiline: true,
                onSave: (nextValue) =>
                  updateForm((current) => ({
                    ...current,
                    conclusion: nextValue,
                  })),
              }),
          )}
          {renderField(
            "Рекомендации",
            form.recommendations || "Введите рекомендации",
            "text",
            Boolean(form.recommendations),
            () =>
              openEditor({
                title: "Рекомендации лимфоузлов",
                mode: "text",
                value: form.recommendations,
                placeholder: "Введите рекомендации",
                multiline: true,
                onSave: (nextValue) =>
                  updateForm((current) => ({
                    ...current,
                    recommendations: nextValue,
                  })),
              }),
          )}
        </View>
      </View>
    </>
  );
}

export default LymphNodesProtocolBlock;
