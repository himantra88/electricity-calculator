// app/sitemap.ts
import { MetadataRoute } from 'next';
import { stateSlugs } from '../lib/statesData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.yourdomain.com'; // Update this before launch

  const stateUrls = stateSlugs.map((state) => ({
    url: `${baseUrl}/calculator/${state.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...stateUrls,
  ];
}
