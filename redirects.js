const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // These pages merged into /about in the 2026 redesign.
  const mergedPageRedirects = [
    { source: '/hobbies', destination: '/about#outside-research', permanent: true },
    { source: '/journal-club', destination: '/about#journal-club', permanent: true },
    { source: '/certificates', destination: '/about#certificates', permanent: true },
    { source: '/courses', destination: '/about#courses', permanent: true },
  ]

  // The story flight moved to /my-story. Temporary, in case the cutover is rolled back.
  const storyRedirects = [{ source: '/my-story/preview', destination: '/my-story', permanent: false }]

  const redirects = [internetExplorerRedirect, ...mergedPageRedirects, ...storyRedirects]

  return redirects
}

export default redirects
