import PageTemplate, { generateMetadata } from './[slug]/page'

// Temporary: Force dynamic rendering to avoid build-time database queries
// Remove this after the migration has been applied in production
export const dynamic = 'force-dynamic'

export default PageTemplate

export { generateMetadata }
