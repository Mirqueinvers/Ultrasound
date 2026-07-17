import React from 'react'
import obpSchema from '../definitions/obp.json'
import { DynamicProtocolForm } from './DynamicProtocolForm'

interface ObpV2Props {
  value?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export const ObpV2: React.FC<ObpV2Props> = ({ value, onChange }) => {
  return (
    <DynamicProtocolForm
      schema={obpSchema as any}
      value={value}
      onChange={onChange}
    />
  )
}

export default ObpV2