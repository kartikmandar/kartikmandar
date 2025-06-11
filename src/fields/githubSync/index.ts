import type { Field } from 'payload'

export const githubSyncField = (): Field[] => [{
  name: 'githubSync',
  type: 'ui',
  admin: {
    components: {
      Field: '@/fields/githubSync/GitHubSyncComponent#GitHubSyncComponent',
    },
    position: 'sidebar',
  },
}]

export default githubSyncField