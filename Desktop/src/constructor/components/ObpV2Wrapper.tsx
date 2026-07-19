import React from 'react'
import obpSchema from '../definitions/obp.json'
import { DynamicProtocolForm } from './DynamicProtocolForm'
import type { SectionKey } from "@components/common/OrgNavigation";

interface ObpV2Props {
  value?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const ObpV2: React.FC<ObpV2Props> = ({ value, onChange, sectionRefs }) => {
  return (
    <DynamicProtocolForm
      schema={obpSchema as any}
      value={value}
      onChange={onChange}
      sectionRefs={sectionRefs}
    />
  )
}

export default ObpV2