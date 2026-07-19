import React from 'react'
import kidneySchema from '../definitions/kidney.json'
import { DynamicProtocolForm } from './DynamicProtocolForm'
import type { SectionKey } from "@components/common/OrgNavigation";

interface KidneyV2Props {
  value?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const KidneyV2: React.FC<KidneyV2Props> = ({ value, onChange, sectionRefs }) => {
  return (
    <DynamicProtocolForm
      schema={kidneySchema as any}
      value={value}
      onChange={onChange}
      sectionRefs={sectionRefs}
    />
  )
}

export default KidneyV2