module.exports = {
  base: '/app/',
  // NOTE: Most of this config must be the same as the one in the app repo to make sure
  //   it's consistent when navigating between the two.
  title: 'Directus',
  description: 'A headless CMS that manages your content, not your workflow.',
  themeConfig: {
    // NOTE: For now, we use the github.com links as long as the docs aren't live yet
    nav: [
      { text: 'Home', link: 'https://directus.github.io/app' },
    ],
    repo: 'directus/app',
    docsDir: 'docs',
    editLinks: true,
  }
};
