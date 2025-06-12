import type { Field } from 'payload'

export const bulkSyncField = (): Field[] => [{
  name: 'bulkSync',
  type: 'ui',
  admin: {
    components: {
      Field: '@/fields/bulkSync/BulkSyncComponent#BulkSyncComponent',
    },
    position: 'sidebar',
  },
}]

export default bulkSyncField