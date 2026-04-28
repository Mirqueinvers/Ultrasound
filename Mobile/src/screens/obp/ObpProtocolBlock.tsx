import { useMemo, useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import {
  FieldEditorModal,
  type FieldEditorOption,
} from "../../components/FieldEditorModal";
import type {
  GallbladderConcretionDraft,
  GallbladderDraft,
  GallbladderPolypDraft,
  LiverDraft,
  ObpDraft,
  PancreasDraft,
  SpleenDraft,
} from "../../shared/obpDraft";

type EditorState = {
  title: string;
  mode: "number" | "select" | "text";
  value: string;
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  onSave: (value: string) => void;
} | null;

type LiverFieldSpec = {
  key: keyof LiverDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
};

type GallbladderFieldKey = Exclude<
  keyof GallbladderDraft,
  "concretionsList" | "polypsList"
>;

type GallbladderFieldSpec = {
  key: GallbladderFieldKey;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  hiddenWhenCholecystectomy?: boolean;
};

type GallbladderConcretionFieldSpec = {
  key: keyof GallbladderConcretionDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  options?: FieldEditorOption[];
};

type GallbladderPolypFieldSpec = {
  key: keyof GallbladderPolypDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  options?: FieldEditorOption[];
};

type PancreasFieldSpec = {
  key: keyof PancreasDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
};

type SpleenFieldSpec = {
  key: keyof SpleenDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
};

type ObpFinalFieldSpec = {
  key: "freeFluid" | "freeFluidDetails" | "conclusion" | "recommendations";
  label: string;
  kind: "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
};

type ObpProtocolBlockProps = {
  styles: any;
  obpDraft: ObpDraft;
  onUpdateLiverField: (field: keyof LiverDraft, value: string) => void;
  onUpdateGallbladderField: (field: keyof GallbladderDraft, value: string) => void;
  onUpdateGallbladderConcretionsList: (
    nextList: GallbladderConcretionDraft[],
  ) => void;
  onUpdateGallbladderPolypsList: (nextList: GallbladderPolypDraft[]) => void;
  onAddGallbladderConcretion: () => void;
  onAddGallbladderPolyp: () => void;
  onUpdatePancreasField: (field: keyof PancreasDraft, value: string) => void;
  onUpdateSpleenField: (field: keyof SpleenDraft, value: string) => void;
  onUpdateFreeFluidField: (
    field: "freeFluid" | "freeFluidDetails",
    value: string,
  ) => void;
  onUpdateConclusionField: (value: string) => void;
  onUpdateRecommendationsField: (value: string) => void;
};

const ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

const HOMOGENEITY_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const CONTOURS_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий, ровный", label: "Чёткий, ровный" },
  { value: "чёткий, не ровный", label: "Чёткий, не ровный" },
  { value: "бугристый", label: "Бугристый" },
];

const LOWER_EDGE_OPTIONS: FieldEditorOption[] = [
  { value: "заострён", label: "Заострён" },
  { value: "закруглён", label: "Закруглён" },
];

const FOCAL_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

const VASCULAR_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "Не изменен" },
  { value: "обеднен", label: "Обеднен" },
  { value: "усилен", label: "Усилен" },
];

const GALLBLADDER_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "холецистэктомия", label: "Холецистэктомия" },
];

const GALLBLADDER_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "Правильная", label: "Правильная" },
  { value: "S-образная", label: "S-образная" },
  { value: "С загибом", label: "С загибом" },
];

const GALLBLADDER_CONSTRICTION_OPTIONS: FieldEditorOption[] = [
  { value: "шейки", label: "Шейка" },
  { value: "тела", label: "Тело" },
  { value: "дна", label: "Дно" },
];

const GALLBLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "Однородное", label: "Однородное" },
  { value: "Взвесь", label: "Взвесь" },
  { value: "Сладж", label: "Сладж" },
];

const GALLBLADDER_YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "Не определяются", label: "Не определяются" },
  { value: "Определяются", label: "Определяются" },
];

const GALLBLADDER_POSITION_DETAIL_OPTIONS: FieldEditorOption[] = [
  { value: "шейке", label: "Шейка" },
  { value: "теле", label: "Тело" },
  { value: "дне", label: "Дно" },
];

const GALLBLADDER_POLYP_WALL_OPTIONS: FieldEditorOption[] = [
  { value: "по передней", label: "Передняя" },
  { value: "по задней", label: "Задняя" },
];

const PANCREAS_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

const PANCREAS_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const PANCREAS_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий, ровный", label: "Чёткий, ровный" },
  { value: "чёткий, не ровный", label: "Чёткий, не ровный" },
  { value: "не чёткий", label: "Не чёткий" },
  { value: "бугристый", label: "Бугристый" },
];

const YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

const SPLEEN_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "спленэктомия", label: "Спленэктомия" },
];

const SPLEEN_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

const SPLEEN_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const SPLEEN_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий, ровный", label: "Чёткий, ровный" },
  { value: "чёткий, не ровный", label: "Чёткий, не ровный" },
  { value: "не чёткий", label: "Не чёткий" },
  { value: "бугристый", label: "Бугристый" },
];

const OBP_FREE_FLUID_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "Не определяется" },
  { value: "определяется", label: "Определяется" },
];

export function ObpProtocolBlock({
  styles,
  obpDraft,
  onUpdateLiverField,
  onUpdateGallbladderField,
  onUpdateGallbladderConcretionsList,
  onUpdateGallbladderPolypsList,
  onAddGallbladderConcretion,
  onAddGallbladderPolyp,
  onUpdatePancreasField,
  onUpdateSpleenField,
  onUpdateFreeFluidField,
  onUpdateConclusionField,
  onUpdateRecommendationsField,
}: ObpProtocolBlockProps) {
  const [editorState, setEditorState] = useState<EditorState>(null);
  const activeGallbladder = obpDraft.gallbladder;
  const isCholecystectomy = activeGallbladder.position === "холецистэктомия";
  const activePancreas = obpDraft.pancreas;
  const activeSpleen = obpDraft.spleen;
  const hasLiverFocalLesions = obpDraft.liver.focalLesionsPresence === "Определяются";
  const hasGallbladderConcretions = activeGallbladder.concretions === "Определяются";
  const hasGallbladderPolyps = activeGallbladder.polyps === "Определяются";
  const hasPancreasPathologicalFormations =
    activePancreas.pathologicalFormations === "Определяются";
  const hasSpleenPathologicalFormations =
    activeSpleen.pathologicalFormations === "Определяются";

  const liverFields: LiverFieldSpec[] = [
    { key: "rightLobeAP", label: "Правая доля, ПЗР", kind: "number", placeholder: "мм" },
    { key: "leftLobeAP", label: "Левая доля, ПЗР", kind: "number", placeholder: "мм" },
    { key: "rightLobeCCR", label: "Правая доля, ККР", kind: "number", placeholder: "мм" },
    { key: "rightLobeCVR", label: "Правая доля, КВР", kind: "number", placeholder: "мм" },
    { key: "leftLobeCCR", label: "Левая доля, ККР", kind: "number", placeholder: "мм" },
    { key: "rightLobeTotal", label: "Правая доля, ККР + ПЗР", kind: "number", placeholder: "Авторасчёт" },
    { key: "leftLobeTotal", label: "Левая доля, ККР + ПЗР", kind: "number", placeholder: "Авторасчёт" },
    { key: "echogenicity", label: "Эхогенность", kind: "select", options: ECHOGENICITY_OPTIONS },
    { key: "homogeneity", label: "Эхоструктура", kind: "select", options: HOMOGENEITY_OPTIONS },
    { key: "contours", label: "Контуры", kind: "select", options: CONTOURS_OPTIONS },
    { key: "lowerEdgeAngle", label: "Угол нижнего края", kind: "select", options: LOWER_EDGE_OPTIONS },
    { key: "focalLesionsPresence", label: "Патологические образования", kind: "select", options: FOCAL_OPTIONS },
    { key: "focalLesions", label: "Описание патологических образований", kind: "text", placeholder: "Введите описание", multiline: true },
    { key: "vascularPattern", label: "Сосудистый рисунок", kind: "select", options: VASCULAR_OPTIONS },
    { key: "portalVeinDiameter", label: "Воротная вена", kind: "number", placeholder: "мм" },
    { key: "ivc", label: "Нижняя полая вена", kind: "number", placeholder: "мм" },
    { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true },
  ];

  const gallbladderFields: GallbladderFieldSpec[] = [
    { key: "position", label: "Положение", kind: "select", options: GALLBLADDER_POSITION_OPTIONS },
    { key: "length", label: "Длина", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true },
    { key: "width", label: "Ширина", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true },
    { key: "wallThickness", label: "Толщина стенки", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true },
    { key: "shape", label: "Форма", kind: "select", options: GALLBLADDER_SHAPE_OPTIONS, hiddenWhenCholecystectomy: true },
    { key: "constriction", label: "Перетяжка", kind: "select", options: GALLBLADDER_CONSTRICTION_OPTIONS, hiddenWhenCholecystectomy: true },
    { key: "contentType", label: "Тип содержимого", kind: "select", options: GALLBLADDER_CONTENT_OPTIONS, hiddenWhenCholecystectomy: true },
    { key: "concretions", label: "Конкременты", kind: "select", options: GALLBLADDER_YES_NO_OPTIONS, hiddenWhenCholecystectomy: true },
    { key: "polyps", label: "Полипы", kind: "select", options: GALLBLADDER_YES_NO_OPTIONS, hiddenWhenCholecystectomy: true },
    { key: "content", label: "Дополнительно по содержимому", kind: "text", placeholder: "Введите описание содержимого", multiline: true, hiddenWhenCholecystectomy: true },
    { key: "cysticDuct", label: "Пузырный проток", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true },
    { key: "commonBileDuct", label: "Общий желчный проток", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true },
    { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true },
  ];

  const gallbladderConcretionFields: GallbladderConcretionFieldSpec[] = [
    { key: "size", label: "Размер", kind: "number", placeholder: "мм" },
    { key: "position", label: "Положение", kind: "select", options: GALLBLADDER_POSITION_DETAIL_OPTIONS },
  ];

  const gallbladderPolypFields: GallbladderPolypFieldSpec[] = [
    { key: "size", label: "Размер", kind: "number", placeholder: "мм" },
    { key: "position", label: "Положение", kind: "select", options: GALLBLADDER_POSITION_DETAIL_OPTIONS },
    { key: "wall", label: "Стенка", kind: "select", options: GALLBLADDER_POLYP_WALL_OPTIONS },
  ];

  const pancreasFields: PancreasFieldSpec[] = [
    { key: "head", label: "Головка", kind: "number", placeholder: "мм" },
    { key: "body", label: "Тело", kind: "number", placeholder: "мм" },
    { key: "tail", label: "Хвост", kind: "number", placeholder: "мм" },
    { key: "echogenicity", label: "Эхогенность", kind: "select", options: PANCREAS_ECHOGENICITY_OPTIONS },
    { key: "echostructure", label: "Эхоструктура", kind: "select", options: PANCREAS_ECHOSTRUCTURE_OPTIONS },
    { key: "contour", label: "Контур", kind: "select", options: PANCREAS_CONTOUR_OPTIONS },
    { key: "pathologicalFormations", label: "Патологические образования", kind: "select", options: YES_NO_OPTIONS },
    { key: "pathologicalFormationsText", label: "Описание патологических образований", kind: "text", placeholder: "Введите описание", multiline: true },
    { key: "wirsungDuct", label: "Вирсунгов проток", kind: "number", placeholder: "мм" },
    { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true },
  ];

  const spleenFields: SpleenFieldSpec[] = [
    { key: "position", label: "Положение", kind: "select", options: SPLEEN_POSITION_OPTIONS },
    { key: "length", label: "Длина", kind: "number", placeholder: "мм" },
    { key: "width", label: "Ширина", kind: "number", placeholder: "мм" },
    { key: "echogenicity", label: "Эхогенность", kind: "select", options: SPLEEN_ECHOGENICITY_OPTIONS },
    { key: "echostructure", label: "Эхоструктура", kind: "select", options: SPLEEN_ECHOSTRUCTURE_OPTIONS },
    { key: "contours", label: "Контуры", kind: "select", options: SPLEEN_CONTOUR_OPTIONS },
    { key: "pathologicalFormations", label: "Патологические образования", kind: "select", options: YES_NO_OPTIONS },
    { key: "pathologicalFormationsText", label: "Описание патологических образований", kind: "text", placeholder: "Введите описание", multiline: true },
    { key: "splenicVein", label: "Селезёночная вена", kind: "number", placeholder: "мм" },
    { key: "splenicArtery", label: "Селезёночная артерия", kind: "number", placeholder: "мм" },
    { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true },
  ];

  const obpFinalFields: ObpFinalFieldSpec[] = [
    { key: "freeFluid", label: "Свободная жидкость в брюшной полости", kind: "select", options: OBP_FREE_FLUID_OPTIONS },
    { key: "freeFluidDetails", label: "Описание свободной жидкости", kind: "text", placeholder: "Введите описание", multiline: true },
    { key: "conclusion", label: "Заключение ОБП", kind: "text", placeholder: "Введите общее заключение", multiline: true },
    { key: "recommendations", label: "Рекомендации", kind: "text", placeholder: "Введите рекомендации", multiline: true },
  ];

  const hasValue = (currentValue: string) => currentValue.trim().length > 0;

  const saveEditor = (value: string) => {
    Keyboard.dismiss();
    editorState?.onSave(value);
    setEditorState(null);
  };

  const openEditor = (config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      setEditorState(config);
    });
  };

  const updateGallbladderConcretionItem = (
    index: number,
    field: keyof GallbladderConcretionDraft,
    value: string,
  ) => {
    const nextList = activeGallbladder.concretionsList.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    onUpdateGallbladderConcretionsList(nextList);
  };

  const updateGallbladderPolypItem = (
    index: number,
    field: keyof GallbladderPolypDraft,
    value: string,
  ) => {
    const nextList = activeGallbladder.polypsList.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    onUpdateGallbladderPolypsList(nextList);
  };

  const updatePancreasFieldValue = (field: keyof PancreasDraft, value: string) => {
    onUpdatePancreasField(field, value);
  };

  const updateSpleenFieldValue = (field: keyof SpleenDraft, value: string) => {
    onUpdateSpleenField(field, value);
  };

  return (
    <View style={styles.activeProtocolBlock}>
      <FieldEditorModal
        visible={Boolean(editorState)}
        title={editorState?.title ?? ""}
        mode={editorState?.mode ?? "text"}
        value={editorState?.value ?? ""}
        options={editorState?.options}
        placeholder={editorState?.placeholder}
        multiline={editorState?.multiline}
        onCancel={() => setEditorState(null)}
        onSave={saveEditor}
      />

      <View style={styles.obpMobileHintCard}>
        <Text style={styles.obpMobileHintTitle}>Печень</Text>
        <Text style={styles.obpMobileHintText}>
          Нажимайте на поля, чтобы открыть полноэкранный ввод нужного типа.
        </Text>
      </View>

      <View style={styles.obpFieldList}>
        {liverFields.map((field) => {
          if (field.key === "focalLesions" && !hasLiverFocalLesions) {
            return null;
          }

          const currentValue = obpDraft.liver[field.key];
          const displayValue = currentValue || "Нажмите для ввода";
          const isReadOnly = field.key === "rightLobeTotal" || field.key === "leftLobeTotal";

          return (
            <Pressable
              key={field.key}
              onPress={() => {
                if (isReadOnly) {
                  return;
                }

                openEditor({
                  title: field.label,
                  mode: field.kind,
                  value: currentValue,
                  placeholder: field.placeholder,
                  multiline: field.multiline,
                  options: field.options,
                  onSave: (nextValue) => onUpdateLiverField(field.key, nextValue),
                });
              }}
              style={({ pressed }) => [
                styles.obpFieldRow,
                hasValue(currentValue) && styles.obpFieldRowFilled,
                isReadOnly && styles.obpFieldRowReadonly,
                pressed && !isReadOnly && styles.obpFieldRowPressed,
              ]}
            >
              <View style={styles.obpFieldRowContent}>
                <Text style={styles.obpFieldLabel}>{field.label}</Text>
                <Text style={styles.obpFieldValue}>{displayValue}</Text>
              </View>

              <Text style={styles.obpFieldType}>
                {isReadOnly
                  ? "auto"
                  : field.kind === "number"
                    ? "numpad"
                    : field.kind === "select"
                      ? "select"
                      : "text"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.obpMobileHintCard}>
        <Text style={styles.obpMobileHintTitle}>Желчный пузырь</Text>
        <Text style={styles.obpMobileHintText}>
          Нажимайте на поля, чтобы открыть полноэкранный ввод нужного типа.
        </Text>
      </View>

      <View style={styles.obpFieldList}>
        {gallbladderFields.map((field) => {
          if (field.hiddenWhenCholecystectomy && isCholecystectomy) {
            return null;
          }

          const currentValue = activeGallbladder[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          return (
            <Pressable
              key={field.key}
              onPress={() => {
                openEditor({
                  title: field.label,
                  mode: field.kind,
                  value: currentValue,
                  placeholder: field.placeholder,
                  multiline: field.multiline,
                  options: field.options,
                  onSave: (nextValue) => onUpdateGallbladderField(field.key, nextValue),
                });
              }}
              style={({ pressed }) => [
                styles.obpFieldRow,
                hasValue(currentValue) && styles.obpFieldRowFilled,
                pressed && styles.obpFieldRowPressed,
              ]}
            >
              <View style={styles.obpFieldRowContent}>
                <Text style={styles.obpFieldLabel}>{field.label}</Text>
                <Text style={styles.obpFieldValue}>{displayValue}</Text>
              </View>

              <Text style={styles.obpFieldType}>
                {field.kind === "number"
                  ? "numpad"
                  : field.kind === "select"
                    ? "select"
                    : "text"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!isCholecystectomy && (
        <>
          {hasGallbladderConcretions && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View>
                  <Text style={styles.sectionLabel}>???????????</Text>
                  <Text style={styles.sectionDesktopKey}>
                    {`${activeGallbladder.concretionsList.length} items`}
                  </Text>
                </View>
              </View>

              <View style={styles.obpFieldList}>
                {activeGallbladder.concretionsList.length === 0 ? (
                  <Text style={styles.helperText}>???????? ???? ?? ???? ??????????.</Text>
                ) : (
                  activeGallbladder.concretionsList.map((item, index) => (
                    <View key={`concretion-${index}`} style={styles.sectionCard}>
                      <View style={styles.sectionCardHeader}>
                        <View>
                          <Text style={styles.sectionLabel}>
                            ?????????? #{index + 1}
                          </Text>
                          <Text style={styles.sectionDesktopKey}>
                            ??????? ???? ??? ??????????????
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            onUpdateGallbladderConcretionsList(
                              activeGallbladder.concretionsList.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          style={({ pressed }) => [
                            styles.secondaryButton,
                            { paddingVertical: 8, paddingHorizontal: 10 },
                            pressed && styles.buttonPressed,
                          ]}
                        >
                          <Text style={styles.secondaryButtonText}>???????</Text>
                        </Pressable>
                      </View>

                      <View style={styles.obpFieldList}>
                        {gallbladderConcretionFields.map((field) => {
                          const currentValue = item[field.key];
                          const displayValue = currentValue || "??????? ??? ?????";

                          return (
                            <Pressable
                              key={`${field.key}-${index}`}
                              onPress={() => {
                                openEditor({
                                  title: `${field.label} #${index + 1}`,
                                  mode: field.kind,
                                  value: currentValue,
                                  placeholder: field.placeholder,
                                  options: field.options,
                                  onSave: (nextValue) =>
                                    updateGallbladderConcretionItem(index, field.key, nextValue),
                                });
                              }}
                              style={[
                                styles.obpFieldRow,
                                hasValue(currentValue) && styles.obpFieldRowFilled,
                              ]}
                            >
                              <View style={styles.obpFieldRowContent}>
                                <Text style={styles.obpFieldLabel}>{field.label}</Text>
                                <Text style={styles.obpFieldValue}>{displayValue}</Text>
                              </View>

                              <Text style={styles.obpFieldType}>
                                {field.kind === "number"
                                  ? "numpad"
                                  : field.kind === "select"
                                    ? "select"
                                    : "text"}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))
                )}

                <Pressable
                  onPress={onAddGallbladderConcretion}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { minWidth: 0, paddingVertical: 10, paddingHorizontal: 12, alignSelf: "flex-start" },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>+ ??????????</Text>
                </Pressable>
              </View>
            </View>
          )}

          {hasGallbladderPolyps && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View>
                  <Text style={styles.sectionLabel}>??????</Text>
                  <Text style={styles.sectionDesktopKey}>
                    {`${activeGallbladder.polypsList.length} items`}
                  </Text>
                </View>
              </View>

              <View style={styles.obpFieldList}>
                {activeGallbladder.polypsList.length === 0 ? (
                  <Text style={styles.helperText}>???????? ???? ?? ???? ?????.</Text>
                ) : (
                  activeGallbladder.polypsList.map((item, index) => (
                    <View key={`polyp-${index}`} style={styles.sectionCard}>
                      <View style={styles.sectionCardHeader}>
                        <View>
                          <Text style={styles.sectionLabel}>????? #{index + 1}</Text>
                          <Text style={styles.sectionDesktopKey}>
                            ??????? ???? ??? ??????????????
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            onUpdateGallbladderPolypsList(
                              activeGallbladder.polypsList.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          style={({ pressed }) => [
                            styles.secondaryButton,
                            { paddingVertical: 8, paddingHorizontal: 10 },
                            pressed && styles.buttonPressed,
                          ]}
                        >
                          <Text style={styles.secondaryButtonText}>???????</Text>
                        </Pressable>
                      </View>

                      <View style={styles.obpFieldList}>
                        {gallbladderPolypFields.map((field) => {
                          const currentValue = item[field.key];
                          const displayValue = currentValue || "??????? ??? ?????";

                          return (
                            <Pressable
                              key={`${field.key}-${index}`}
                              onPress={() => {
                                openEditor({
                                  title: `${field.label} #${index + 1}`,
                                  mode: field.kind,
                                  value: currentValue,
                                  placeholder: field.placeholder,
                                  options: field.options,
                                  onSave: (nextValue) =>
                                    updateGallbladderPolypItem(index, field.key, nextValue),
                                });
                              }}
                              style={[
                                styles.obpFieldRow,
                                hasValue(currentValue) && styles.obpFieldRowFilled,
                              ]}
                            >
                              <View style={styles.obpFieldRowContent}>
                                <Text style={styles.obpFieldLabel}>{field.label}</Text>
                                <Text style={styles.obpFieldValue}>{displayValue}</Text>
                              </View>

                              <Text style={styles.obpFieldType}>
                                {field.kind === "number"
                                  ? "numpad"
                                  : field.kind === "select"
                                    ? "select"
                                    : "text"}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))
                )}

                <Pressable
                  onPress={onAddGallbladderPolyp}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { minWidth: 0, paddingVertical: 10, paddingHorizontal: 12, alignSelf: "flex-start" },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>+ ?????</Text>
                </Pressable>
              </View>
            </View>
          )}
        </>
      )}


      <View style={styles.obpMobileHintCard}>
        <Text style={styles.obpMobileHintTitle}>Поджелудочная железа</Text>
        <Text style={styles.obpMobileHintText}>
          Нажимайте на поля, чтобы открыть полноэкранный ввод нужного типа.
        </Text>
      </View>

      <View style={styles.obpFieldList}>
        {pancreasFields.map((field) => {
          if (field.key === "pathologicalFormationsText" && !hasPancreasPathologicalFormations) {
            return null;
          }

          const currentValue = activePancreas[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          return (
            <Pressable
              key={field.key}
              onPress={() => {
                openEditor({
                  title: field.label,
                  mode: field.kind,
                  value: currentValue,
                  placeholder: field.placeholder,
                  multiline: field.multiline,
                  options: field.options,
                  onSave: (nextValue) => updatePancreasFieldValue(field.key, nextValue),
                });
              }}
              style={({ pressed }) => [
                styles.obpFieldRow,
                hasValue(currentValue) && styles.obpFieldRowFilled,
                pressed && styles.obpFieldRowPressed,
              ]}
            >
              <View style={styles.obpFieldRowContent}>
                <Text style={styles.obpFieldLabel}>{field.label}</Text>
                <Text style={styles.obpFieldValue}>{displayValue}</Text>
              </View>

              <Text style={styles.obpFieldType}>
                {field.kind === "number"
                  ? "numpad"
                  : field.kind === "select"
                    ? "select"
                    : "text"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.obpMobileHintCard}>
        <Text style={styles.obpMobileHintTitle}>Селезёнка</Text>
        <Text style={styles.obpMobileHintText}>
          Нажимайте на поля, чтобы открыть полноэкранный ввод нужного типа.
        </Text>
      </View>

      <View style={styles.obpFieldList}>
        {spleenFields.map((field) => {
          if (field.key === "pathologicalFormationsText" && !hasSpleenPathologicalFormations) {
            return null;
          }

          const currentValue = activeSpleen[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          return (
            <Pressable
              key={field.key}
              onPress={() => {
                openEditor({
                  title: field.label,
                  mode: field.kind,
                  value: currentValue,
                  placeholder: field.placeholder,
                  multiline: field.multiline,
                  options: field.options,
                  onSave: (nextValue) => updateSpleenFieldValue(field.key, nextValue),
                });
              }}
              style={({ pressed }) => [
                styles.obpFieldRow,
                hasValue(currentValue) && styles.obpFieldRowFilled,
                pressed && styles.obpFieldRowPressed,
              ]}
            >
              <View style={styles.obpFieldRowContent}>
                <Text style={styles.obpFieldLabel}>{field.label}</Text>
                <Text style={styles.obpFieldValue}>{displayValue}</Text>
              </View>

              <Text style={styles.obpFieldType}>
                {field.kind === "number"
                  ? "numpad"
                  : field.kind === "select"
                    ? "select"
                    : "text"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.obpMobileHintCard}>
        <Text style={styles.obpMobileHintTitle}>Свободная жидкость</Text>
        <Text style={styles.obpMobileHintText}>
          Укажите наличие свободной жидкости и её описание.
        </Text>
      </View>

      <View style={styles.obpFieldList}>
        <Pressable
          onPress={() => {
            openEditor({
              title: obpFinalFields[0].label,
              mode: "select",
              value: obpDraft.freeFluid,
              options: obpFinalFields[0].options,
              onSave: (nextValue) => onUpdateFreeFluidField("freeFluid", nextValue),
            });
          }}
          style={({ pressed }) => [
            styles.obpFieldRow,
            hasValue(obpDraft.freeFluid) && styles.obpFieldRowFilled,
            pressed && styles.obpFieldRowPressed,
          ]}
        >
          <View style={styles.obpFieldRowContent}>
            <Text style={styles.obpFieldLabel}>{obpFinalFields[0].label}</Text>
            <Text style={styles.obpFieldValue}>
              {obpDraft.freeFluid || "Нажмите для ввода"}
            </Text>
          </View>
          <Text style={styles.obpFieldType}>select</Text>
        </Pressable>

        {obpDraft.freeFluid === "определяется" && (
          <Pressable
            onPress={() => {
              openEditor({
                title: obpFinalFields[1].label,
                mode: "text",
                value: obpDraft.freeFluidDetails,
                placeholder: obpFinalFields[1].placeholder,
                multiline: true,
                onSave: (nextValue) => onUpdateFreeFluidField("freeFluidDetails", nextValue),
              });
            }}
            style={({ pressed }) => [
              styles.obpFieldRow,
              hasValue(obpDraft.freeFluidDetails) && styles.obpFieldRowFilled,
              pressed && styles.obpFieldRowPressed,
            ]}
          >
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>{obpFinalFields[1].label}</Text>
              <Text style={styles.obpFieldValue}>
                {obpDraft.freeFluidDetails || "Нажмите для ввода"}
              </Text>
            </View>
            <Text style={styles.obpFieldType}>text</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.obpMobileHintCard}>
        <Text style={styles.obpMobileHintTitle}>Итоговое заключение</Text>
        <Text style={styles.obpMobileHintText}>
          Заполните общее заключение и рекомендации для всего ОБП.
        </Text>
      </View>

      <View style={styles.obpFieldList}>
        <Pressable
          onPress={() => {
            openEditor({
              title: obpFinalFields[2].label,
              mode: "text",
              value: obpDraft.conclusion,
              placeholder: obpFinalFields[2].placeholder,
              multiline: true,
              onSave: onUpdateConclusionField,
            });
          }}
          style={({ pressed }) => [
            styles.obpFieldRow,
            hasValue(obpDraft.conclusion) && styles.obpFieldRowFilled,
            pressed && styles.obpFieldRowPressed,
          ]}
        >
          <View style={styles.obpFieldRowContent}>
            <Text style={styles.obpFieldLabel}>{obpFinalFields[2].label}</Text>
            <Text style={styles.obpFieldValue}>
              {obpDraft.conclusion || "Нажмите для ввода"}
            </Text>
          </View>
          <Text style={styles.obpFieldType}>text</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            openEditor({
              title: obpFinalFields[3].label,
              mode: "text",
              value: obpDraft.recommendations,
              placeholder: obpFinalFields[3].placeholder,
              multiline: true,
              onSave: onUpdateRecommendationsField,
            });
          }}
          style={({ pressed }) => [
            styles.obpFieldRow,
            hasValue(obpDraft.recommendations) && styles.obpFieldRowFilled,
            pressed && styles.obpFieldRowPressed,
          ]}
        >
          <View style={styles.obpFieldRowContent}>
            <Text style={styles.obpFieldLabel}>{obpFinalFields[3].label}</Text>
            <Text style={styles.obpFieldValue}>
              {obpDraft.recommendations || "Нажмите для ввода"}
            </Text>
          </View>
          <Text style={styles.obpFieldType}>text</Text>
        </Pressable>
      </View>
    </View>
  );
}
