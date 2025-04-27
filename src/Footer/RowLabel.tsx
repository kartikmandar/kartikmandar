'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

interface NavItem {
  link?: {
    label?: string;
    url?: string;
  };
}

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NavItem>()

  const label = data?.data?.link?.label
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
    : 'Row'

  return <div>{label}</div>
}
