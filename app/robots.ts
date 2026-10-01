import { MetadataRoute } from 'next';
import { AGENCY_CONFIG } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${AGENCY_CONFIG.siteUrl}/sitemap.xml`,
  };
}
