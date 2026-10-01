import { MetadataRoute } from 'next';
import { AGENCY_CONFIG } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: AGENCY_CONFIG.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
