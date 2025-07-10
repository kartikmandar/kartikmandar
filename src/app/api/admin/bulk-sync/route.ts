import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Get all projects with GitHub URLs
    const projects = await payload.find({
      collection: 'projects',
      where: {
        'links.githubUrl': {
          exists: true,
        },
      },
      limit: 1000,
    })

    const results = []
    let successCount = 0
    let errorCount = 0

    // Process each project
    for (const project of projects.docs) {
      try {
        const githubUrl = project.links?.githubUrl
        if (!githubUrl) continue

        // Call the sync GitHub endpoint for this project
        const syncResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sync-github-single?projectId=${project.id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (syncResponse.ok) {
          results.push({
            success: true,
            projectId: project.id,
            projectTitle: project.title,
          })
          successCount++
        } else {
          throw new Error(`HTTP ${syncResponse.status}`)
        }
      } catch (error) {
        results.push({
          success: false,
          projectId: project.id,
          projectTitle: project.title,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalProcessed: projects.docs.length,
      totalSuccess: successCount,
      totalErrors: errorCount,
    })
  } catch (error) {
    console.error('Bulk sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}