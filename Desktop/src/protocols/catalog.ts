import type {
  ProtocolDefinition,
  ProtocolDraft,
  ProtocolFieldDefinition,
  ProtocolId,
  ProtocolManifest,
  ProtocolSectionDefinition,
  ProtocolSectionManifest,
  ProtocolSelectionLabel,
} from './types'

export const SECTION_DEFINITIONS = [
  { id: 'obp.liver', protocolId: 'obp', desktopKey: 'ОБП:печень', label: 'Печень', order: 1 },
  { id: 'obp.gallbladder', protocolId: 'obp', desktopKey: 'ОБП:желчный', label: 'Желчный пузырь', order: 2 },
  { id: 'obp.pancreas', protocolId: 'obp', desktopKey: 'ОБП:поджелудочная', label: 'Поджелудочная железа', order: 3 },
  { id: 'obp.spleen', protocolId: 'obp', desktopKey: 'ОБП:селезёнка', label: 'Селезёнка', order: 4 },
  { id: 'kidneys.right', protocolId: 'kidneys', desktopKey: 'Почки:правая', label: 'Правая почка', order: 1 },
  { id: 'kidneys.left', protocolId: 'kidneys', desktopKey: 'Почки:левая', label: 'Левая почка', order: 2 },
  { id: 'kidneys.bladder', protocolId: 'kidneys', desktopKey: 'Почки:мочевой пузырь', label: 'Мочевой пузырь', order: 3 },
  { id: 'scrotum.right_testis', protocolId: 'scrotum', desktopKey: 'Органы мошонки:правое яичко', label: 'Правое яичко', order: 1 },
  { id: 'scrotum.left_testis', protocolId: 'scrotum', desktopKey: 'Органы мошонки:левое яичко', label: 'Левое яичко', order: 2 },
  { id: 'omt_female.uterus', protocolId: 'omt_female', desktopKey: 'ОМТ (Ж):матка', label: 'Матка', order: 1 },
  { id: 'omt_female.right_ovary', protocolId: 'omt_female', desktopKey: 'ОМТ (Ж):правый яичник', label: 'Правый яичник', order: 2 },
  { id: 'omt_female.left_ovary', protocolId: 'omt_female', desktopKey: 'ОМТ (Ж):левый яичник', label: 'Левый яичник', order: 3 },
  { id: 'omt_female.bladder', protocolId: 'omt_female', desktopKey: 'ОМТ (Ж):мочевой пузырь', label: 'Мочевой пузырь', order: 4 },
  { id: 'omt_male.prostate', protocolId: 'omt_male', desktopKey: 'ОМТ (М):простата', label: 'Предстательная железа', order: 1 },
  { id: 'omt_male.bladder', protocolId: 'omt_male', desktopKey: 'ОМТ (М):мочевой пузырь', label: 'Мочевой пузырь', order: 2 },
  { id: 'thyroid.right_lobe', protocolId: 'thyroid', desktopKey: 'Щитовидная железа:правая доля', label: 'Правая доля', order: 1 },
  { id: 'thyroid.left_lobe', protocolId: 'thyroid', desktopKey: 'Щитовидная железа:левая доля', label: 'Левая доля', order: 2 },
  { id: 'pleural.right', protocolId: 'pleural', desktopKey: 'Плевральная полость:правая', label: 'Правая плевральная полость', order: 1 },
  { id: 'pleural.left', protocolId: 'pleural', desktopKey: 'Плевральная полость:левая', label: 'Левая плевральная полость', order: 2 },
  { id: 'salivary_glands.right_parotid', protocolId: 'salivary_glands', desktopKey: 'Слюнные железы:околоушная правая', label: 'Околоушная правая', order: 1 },
  { id: 'salivary_glands.left_parotid', protocolId: 'salivary_glands', desktopKey: 'Слюнные железы:околоушная левая', label: 'Околоушная левая', order: 2 },
  { id: 'salivary_glands.right_submandibular', protocolId: 'salivary_glands', desktopKey: 'Слюнные железы:подчелюстная правая', label: 'Подчелюстная правая', order: 3 },
  { id: 'salivary_glands.left_submandibular', protocolId: 'salivary_glands', desktopKey: 'Слюнные железы:подчелюстная левая', label: 'Подчелюстная левая', order: 4 },
  { id: 'salivary_glands.right_sublingual', protocolId: 'salivary_glands', desktopKey: 'Слюнные железы:подъязычная правая', label: 'Подъязычная правая', order: 5 },
  { id: 'salivary_glands.left_sublingual', protocolId: 'salivary_glands', desktopKey: 'Слюнные железы:подъязычная левая', label: 'Подъязычная левая', order: 6 },
  { id: 'brachio_cephalic_arteries.right_osa', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:ОСА правая', label: 'ОСА правая', order: 1 },
  { id: 'brachio_cephalic_arteries.right_vsa', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:ВСА правая', label: 'ВСА правая', order: 2 },
  { id: 'brachio_cephalic_arteries.right_nsa', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:НСА правая', label: 'НСА правая', order: 3 },
  { id: 'brachio_cephalic_arteries.right_vertebral', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:позвоночная правая', label: 'Позвоночная правая', order: 4 },
  { id: 'brachio_cephalic_arteries.right_subclavian', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:подключичная правая', label: 'Подключичная правая', order: 5 },
  { id: 'brachio_cephalic_arteries.left_osa', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:ОСА левая', label: 'ОСА левая', order: 6 },
  { id: 'brachio_cephalic_arteries.left_vsa', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:ВСА левая', label: 'ВСА левая', order: 7 },
  { id: 'brachio_cephalic_arteries.left_nsa', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:НСА левая', label: 'НСА левая', order: 8 },
  { id: 'brachio_cephalic_arteries.left_vertebral', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:позвоночная левая', label: 'Позвоночная левая', order: 9 },
  { id: 'brachio_cephalic_arteries.left_subclavian', protocolId: 'brachio_cephalic_arteries', desktopKey: 'БЦА:подключичная левая', label: 'Подключичная левая', order: 10 },
  { id: 'lower_extremity_veins.right_femoral', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:бедренная правая', label: 'Бедренная правая', order: 1 },
  { id: 'lower_extremity_veins.left_femoral', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:бедренная левая', label: 'Бедренная левая', order: 2 },
  { id: 'lower_extremity_veins.right_popliteal', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:подколенная правая', label: 'Подколенная правая', order: 3 },
  { id: 'lower_extremity_veins.left_popliteal', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:подколенная левая', label: 'Подколенная левая', order: 4 },
  { id: 'lower_extremity_veins.right_tibial', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:большеберцовая правая', label: 'Большеберцовая правая', order: 5 },
  { id: 'lower_extremity_veins.left_tibial', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:большеберцовая левая', label: 'Большеберцовая левая', order: 6 },
  { id: 'lower_extremity_veins.right_pv', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:БПВ правая', label: 'БПВ правая', order: 7 },
  { id: 'lower_extremity_veins.left_pv', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:БПВ левая', label: 'БПВ левая', order: 8 },
  { id: 'lower_extremity_veins.right_mv', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:МПВ правая', label: 'МПВ правая', order: 9 },
  { id: 'lower_extremity_veins.left_mv', protocolId: 'lower_extremity_veins', desktopKey: 'Вены НК:МПВ левая', label: 'МПВ левая', order: 10 },
  { id: 'breast.right', protocolId: 'breast', desktopKey: 'Молочные железы:правая железа', label: 'Правая молочная железа', order: 1 },
  { id: 'breast.left', protocolId: 'breast', desktopKey: 'Молочные железы:левая железа', label: 'Левая молочная железа', order: 2 },
  { id: 'soft_tissue.main', protocolId: 'soft_tissue', desktopKey: 'Мягкие ткани:основной блок', label: 'Основной блок', order: 1 },
  { id: 'lymph_nodes.submandibular', protocolId: 'lymph_nodes', desktopKey: 'Лимфатические узлы:Поднижнечелюстные', label: 'Поднижнечелюстные', order: 1 },
  { id: 'lymph_nodes.cervical', protocolId: 'lymph_nodes', desktopKey: 'Лимфатические узлы:Шейные', label: 'Шейные', order: 2 },
  { id: 'lymph_nodes.supraclavicular', protocolId: 'lymph_nodes', desktopKey: 'Лимфатические узлы:Подключичные', label: 'Подключичные', order: 3 },
  { id: 'lymph_nodes.subclavian', protocolId: 'lymph_nodes', desktopKey: 'Лимфатические узлы:Надключичные', label: 'Надключичные', order: 4 },
  { id: 'lymph_nodes.axillary', protocolId: 'lymph_nodes', desktopKey: 'Лимфатические узлы:Подмышечные', label: 'Подмышечные', order: 5 },
  { id: 'lymph_nodes.inguinal', protocolId: 'lymph_nodes', desktopKey: 'Лимфатические узлы:Паховые', label: 'Паховые', order: 6 },
] as const satisfies readonly ProtocolSectionDefinition[]

export const PROTOCOL_DEFINITIONS = [
  {
    id: 'obp',
    selectionLabel: 'ОБП',
    title: 'УЗИ органов брюшной полости',
    description: 'Печень, желчный пузырь, поджелудочная железа и селезёнка.',
    sectionIds: ['obp.liver', 'obp.gallbladder', 'obp.pancreas', 'obp.spleen'],
  },
  {
    id: 'obp_v2',
    selectionLabel: 'ОБП (v2)',
    title: 'УЗИ органов брюшной полости (v2)',
    description: 'Печень, желчный пузырь, поджелудочная железа (динамическая форма из JSON).',
    sectionIds: ['obp.liver', 'obp.gallbladder', 'obp.pancreas'],
  },
  {
    id: 'kidneys',
    selectionLabel: 'Почки',
    title: 'УЗИ почек',
    description: 'Правая и левая почка, мочевой пузырь.',
    sectionIds: ['kidneys.right', 'kidneys.left', 'kidneys.bladder'],
  },
  {
    id: 'scrotum',
    selectionLabel: 'Органы мошонки',
    title: 'УЗИ органов мошонки',
    description: 'Правое и левое яичко.',
    sectionIds: ['scrotum.right_testis', 'scrotum.left_testis'],
  },
  {
    id: 'omt_female',
    selectionLabel: 'ОМТ (Ж)',
    title: 'УЗИ органов малого таза у женщин',
    description: 'Матка, яичники и мочевой пузырь.',
    sectionIds: ['omt_female.uterus', 'omt_female.right_ovary', 'omt_female.left_ovary', 'omt_female.bladder'],
  },
  {
    id: 'omt_male',
    selectionLabel: 'ОМТ (М)',
    title: 'УЗИ органов малого таза у мужчин',
    description: 'Простата и мочевой пузырь.',
    sectionIds: ['omt_male.prostate', 'omt_male.bladder'],
  },
  {
    id: 'thyroid',
    selectionLabel: 'Щитовидная железа',
    title: 'УЗИ щитовидной железы',
    description: 'Правая и левая доля.',
    sectionIds: ['thyroid.right_lobe', 'thyroid.left_lobe'],
  },
  {
    id: 'salivary_glands',
    selectionLabel: 'Слюнные железы',
    title: 'УЗИ слюнных желёз',
    description: 'Околоушные, подчелюстные и подъязычные железы.',
    sectionIds: [
      'salivary_glands.right_parotid',
      'salivary_glands.left_parotid',
      'salivary_glands.right_submandibular',
      'salivary_glands.left_submandibular',
      'salivary_glands.right_sublingual',
      'salivary_glands.left_sublingual',
    ],
  },
  {
    id: 'brachio_cephalic_arteries',
    selectionLabel: 'БЦА',
    title: 'УЗИ брахиоцефальных артерий',
    description: 'Общие, внутренние, наружные сонные, позвоночные и подключичные артерии.',
    sectionIds: [
      'brachio_cephalic_arteries.right_osa',
      'brachio_cephalic_arteries.right_vsa',
      'brachio_cephalic_arteries.right_nsa',
      'brachio_cephalic_arteries.right_vertebral',
      'brachio_cephalic_arteries.right_subclavian',
      'brachio_cephalic_arteries.left_osa',
      'brachio_cephalic_arteries.left_vsa',
      'brachio_cephalic_arteries.left_nsa',
      'brachio_cephalic_arteries.left_vertebral',
      'brachio_cephalic_arteries.left_subclavian',
    ],
  },
  {
    id: 'lower_extremity_veins',
    selectionLabel: 'УВНК',
    title: 'УЗИ вен нижних конечностей',
    description: 'Бедренные, подколенные, большеберцовые и магистральные вены.',
    sectionIds: [
      'lower_extremity_veins.right_femoral',
      'lower_extremity_veins.left_femoral',
      'lower_extremity_veins.right_popliteal',
      'lower_extremity_veins.left_popliteal',
      'lower_extremity_veins.right_tibial',
      'lower_extremity_veins.left_tibial',
      'lower_extremity_veins.right_pv',
      'lower_extremity_veins.left_pv',
      'lower_extremity_veins.right_mv',
      'lower_extremity_veins.left_mv',
    ],
  },
  {
    id: 'breast',
    selectionLabel: 'Молочные железы',
    title: 'УЗИ молочных желёз',
    description: 'Правая и левая молочная железа.',
    sectionIds: ['breast.right', 'breast.left'],
  },
  {
    id: 'child_dispensary',
    selectionLabel: 'Детская диспансеризация',
    title: 'Детская диспансеризация',
    description: 'Шаблон осмотра без секционной навигации.',
    sectionIds: [],
  },
  {
    id: 'soft_tissue',
    selectionLabel: 'Мягких тканей',
    title: 'УЗИ мягких тканей',
    description: 'Одна форма с общим блоком и заключением.',
    sectionIds: ['soft_tissue.main'],
  },
  {
    id: 'urinary_bladder',
    selectionLabel: 'Мочевой пузырь',
    title: 'УЗИ мочевого пузыря',
    description: 'Шаблон без дополнительных внутренних секций.',
    sectionIds: [],
  },
  {
    id: 'pleural',
    selectionLabel: 'Плевральные полости',
    title: 'УЗИ плевральных полостей',
    description: 'Правая и левая плевральная полость.',
    sectionIds: ['pleural.right', 'pleural.left'],
  },
  {
    id: 'lymph_nodes',
    selectionLabel: 'Лимфоузлы',
    title: 'УЗИ лимфатических узлов',
    description: 'Поднижнечелюстные, шейные, подключичные и другие группы лимфоузлов.',
    sectionIds: [
      'lymph_nodes.submandibular',
      'lymph_nodes.cervical',
      'lymph_nodes.supraclavicular',
      'lymph_nodes.subclavian',
      'lymph_nodes.axillary',
      'lymph_nodes.inguinal',
    ],
  },
] as const satisfies readonly ProtocolDefinition[]

const PROTOCOLS = [...PROTOCOL_DEFINITIONS]
const SECTIONS = [...SECTION_DEFINITIONS]

export type DesktopSectionKey = (typeof SECTIONS)[number]['desktopKey']
export type SectionKey = DesktopSectionKey | 'Заключение'

export const PROTOCOL_SELECTIONS: Array<{
  id: ProtocolId
  label: ProtocolSelectionLabel
}> = PROTOCOLS.map((protocol) => ({
  id: protocol.id,
  label: protocol.selectionLabel,
}))

export const PROTOCOL_SUMMARY: Array<{
  id: ProtocolId
  label: ProtocolSelectionLabel
  title: string
  description: string
}> = PROTOCOLS.map((protocol) => ({
  id: protocol.id,
  label: protocol.selectionLabel,
  title: protocol.title,
  description: protocol.description,
}))

export const PROTOCOL_BY_ID = PROTOCOLS.reduce(
  (accumulator, protocol) => {
    accumulator[protocol.id] = protocol
    return accumulator
  },
  {} as Record<ProtocolId, ProtocolDefinition>,
)

export const PROTOCOL_BY_LABEL = PROTOCOLS.reduce(
  (accumulator, protocol) => {
    accumulator[protocol.selectionLabel] = protocol
    return accumulator
  },
  {} as Record<ProtocolSelectionLabel, ProtocolDefinition>,
)

export const SECTION_BY_KEY = SECTIONS.reduce(
  (accumulator, section) => {
    accumulator[section.desktopKey] = section
    return accumulator
  },
  {} as Record<string, ProtocolSectionDefinition>,
)

export const PROTOCOL_SECTION_KEYS = SECTIONS.map((section) => section.desktopKey)

export const PROTOCOL_SECTION_LABELS = SECTIONS.reduce(
  (accumulator, section) => {
    accumulator[section.desktopKey] = section.label
    return accumulator
  },
  { Заключение: 'Заключение' } as Record<SectionKey, string>,
)

export const SECTION_KEYS_BY_PROTOCOL = PROTOCOLS.reduce(
  (accumulator, protocol) => {
    accumulator[protocol.id] = protocol.sectionIds.map((sectionId) => {
      const section = SECTIONS.find((item) => item.id === sectionId)
      if (!section) {
        throw new Error(`Unknown protocol section id: ${sectionId}`)
      }

      return section.desktopKey
    }) as DesktopSectionKey[]
    return accumulator
  },
  {} as Record<ProtocolId, DesktopSectionKey[]>,
)

export const PROTOCOL_MANIFESTS: ProtocolManifest[] = PROTOCOLS.map((protocol) => {
  const sectionKeys = SECTION_KEYS_BY_PROTOCOL[protocol.id]

  return {
    id: protocol.id,
    selectionLabel: protocol.selectionLabel,
    title: protocol.title,
    description: protocol.description,
    sectionKeys,
    sections: sectionKeys.map((sectionKey) => {
      const section = SECTION_BY_KEY[sectionKey]
      return {
        id: section.id,
        desktopKey: section.desktopKey,
        label: section.label,
        order: section.order,
      } satisfies ProtocolSectionManifest
    }),
  }
})

export const PROTOCOL_MANIFEST_BY_ID = PROTOCOL_MANIFESTS.reduce(
  (accumulator, manifest) => {
    accumulator[manifest.id] = manifest
    return accumulator
  },
  {} as Record<ProtocolId, ProtocolManifest>,
)

export const PROTOCOL_MANIFEST_BY_LABEL = PROTOCOL_MANIFESTS.reduce(
  (accumulator, manifest) => {
    accumulator[manifest.selectionLabel] = manifest
    return accumulator
  },
  {} as Record<ProtocolSelectionLabel, ProtocolManifest>,
)

export function getProtocolBySelectionLabel(
  label: string,
): ProtocolDefinition | undefined {
  return PROTOCOLS.find((protocol) => protocol.selectionLabel === label)
}

export function getProtocolById(protocolId: ProtocolId): ProtocolDefinition | undefined {
  return PROTOCOLS.find((protocol) => protocol.id === protocolId)
}

export function getProtocolManifestById(
  protocolId: ProtocolId,
): ProtocolManifest | undefined {
  return PROTOCOL_MANIFEST_BY_ID[protocolId]
}

export function getProtocolManifestByLabel(
  label: string,
): ProtocolManifest | undefined {
  return PROTOCOL_MANIFEST_BY_LABEL[label as ProtocolSelectionLabel]
}

export function getProtocolSelectionOptions() {
  return PROTOCOL_MANIFESTS.map((manifest) => ({
    id: manifest.id,
    label: manifest.selectionLabel,
    title: manifest.title,
    description: manifest.description,
  }))
}

export function getProtocolSectionDefinitions(
  protocolId: ProtocolId,
): ProtocolSectionDefinition[] {
  const manifest = PROTOCOL_MANIFEST_BY_ID[protocolId]
  if (!manifest) {
    return []
  }

  return manifest.sectionKeys
    .map((sectionKey) => SECTION_BY_KEY[sectionKey])
    .filter((section): section is ProtocolSectionDefinition => Boolean(section))
}

export function getSectionDefinitionByDesktopKey(
  desktopKey: string,
): ProtocolSectionDefinition | undefined {
  return SECTION_BY_KEY[desktopKey]
}

export function getAvailableSectionKeys(selectedProtocols: string[]): SectionKey[] {
  const sectionKeys: SectionKey[] = []
  const seen = new Set<SectionKey>()

  selectedProtocols.forEach((label) => {
    const protocol = getProtocolBySelectionLabel(label)
    if (!protocol) {
      return
    }

    SECTION_KEYS_BY_PROTOCOL[protocol.id].forEach((sectionKey) => {
      if (seen.has(sectionKey)) {
        return
      }

      seen.add(sectionKey)
      sectionKeys.push(sectionKey)
    })
  })

  if (sectionKeys.length > 0) {
    sectionKeys.push('Заключение')
  }

  return sectionKeys
}

export function getAllSectionKeys(): SectionKey[] {
  return [...PROTOCOL_SECTION_KEYS, 'Заключение']
}

export function createProtocolDraft(): ProtocolDraft {
  return {
    protocolId: null,
    activeSectionId: null,
    updatedAt: new Date().toISOString(),
    fields: {},
  }
}

export function createFieldDefinition(
  definition: ProtocolFieldDefinition,
): ProtocolFieldDefinition {
  return definition
}
