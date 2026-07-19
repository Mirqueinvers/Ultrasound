export interface ProtocolSectionDefinition {
  id: ProtocolSectionId
  protocolId: ProtocolId
  desktopKey: string
  label: string
  order: number
}

export interface ProtocolDefinition {
  id: ProtocolId
  selectionLabel: ProtocolSelectionLabel
  title: string
  description: string
  sectionIds: readonly ProtocolSectionId[]
}

export interface ProtocolFieldDefinition {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'toggle' | 'date'
  sectionId?: ProtocolSectionId
  required?: boolean
}

export interface ProtocolDraft {
  protocolId: ProtocolId | null
  activeSectionId: ProtocolSectionId | null
  updatedAt: string
  fields: Record<string, unknown>
}

export interface ProtocolPatch {
  protocolId: ProtocolId
  path: string
  value: unknown
  updatedAt: string
}

export interface ProtocolSectionManifest {
  id: ProtocolSectionId
  desktopKey: string
  label: string
  order: number
}

export interface ProtocolManifest {
  id: ProtocolId
  selectionLabel: ProtocolSelectionLabel
  title: string
  description: string
  sectionKeys: string[]
  sections: ProtocolSectionManifest[]
}

export type ProtocolId =
  | 'obp'
  | 'obp_v2'
  | 'kidneys'
  | 'scrotum'
  | 'omt_female'
  | 'omt_male'
  | 'thyroid'
  | 'salivary_glands'
  | 'brachio_cephalic_arteries'
  | 'lower_extremity_veins'
  | 'breast'
  | 'child_dispensary'
  | 'soft_tissue'
  | 'urinary_bladder'
  | 'pleural'
  | 'lymph_nodes'

export type ProtocolSelectionLabel =
  | 'ОБП'
  | 'ОБП (v2)'
  | 'Почки'
  | 'Органы мошонки'
  | 'ОМТ (Ж)'
  | 'ОМТ (М)'
  | 'Щитовидная железа'
  | 'Слюнные железы'
  | 'БЦА'
  | 'УВНК'
  | 'Молочные железы'
  | 'Детская диспансеризация'
  | 'Мягких тканей'
  | 'Мочевой пузырь'
  | 'Плевральные полости'
  | 'Лимфоузлы'

export type ProtocolSectionId =
  | 'obp.liver'
  | 'obp.gallbladder'
  | 'obp.pancreas'
  | 'obp.spleen'
  | 'obp.freeFluid'
  | 'kidneys.right'
  | 'kidneys.left'
  | 'kidneys.bladder'
  | 'scrotum.right_testis'
  | 'scrotum.left_testis'
  | 'omt_female.uterus'
  | 'omt_female.right_ovary'
  | 'omt_female.left_ovary'
  | 'omt_female.bladder'
  | 'omt_male.prostate'
  | 'omt_male.bladder'
  | 'thyroid.right_lobe'
  | 'thyroid.left_lobe'
  | 'pleural.right'
  | 'pleural.left'
  | 'salivary_glands.right_parotid'
  | 'salivary_glands.left_parotid'
  | 'salivary_glands.right_submandibular'
  | 'salivary_glands.left_submandibular'
  | 'salivary_glands.right_sublingual'
  | 'salivary_glands.left_sublingual'
  | 'brachio_cephalic_arteries.right_osa'
  | 'brachio_cephalic_arteries.right_vsa'
  | 'brachio_cephalic_arteries.right_nsa'
  | 'brachio_cephalic_arteries.right_vertebral'
  | 'brachio_cephalic_arteries.right_subclavian'
  | 'brachio_cephalic_arteries.left_osa'
  | 'brachio_cephalic_arteries.left_vsa'
  | 'brachio_cephalic_arteries.left_nsa'
  | 'brachio_cephalic_arteries.left_vertebral'
  | 'brachio_cephalic_arteries.left_subclavian'
  | 'lower_extremity_veins.right_femoral'
  | 'lower_extremity_veins.left_femoral'
  | 'lower_extremity_veins.right_popliteal'
  | 'lower_extremity_veins.left_popliteal'
  | 'lower_extremity_veins.right_tibial'
  | 'lower_extremity_veins.left_tibial'
  | 'lower_extremity_veins.right_pv'
  | 'lower_extremity_veins.left_pv'
  | 'lower_extremity_veins.right_mv'
  | 'lower_extremity_veins.left_mv'
  | 'breast.right'
  | 'breast.left'
  | 'soft_tissue.main'
  | 'lymph_nodes.submandibular'
  | 'lymph_nodes.cervical'
  | 'lymph_nodes.supraclavicular'
  | 'lymph_nodes.subclavian'
  | 'lymph_nodes.axillary'
  | 'lymph_nodes.inguinal'
