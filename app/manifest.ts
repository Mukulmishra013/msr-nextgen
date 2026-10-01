import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MSR Next Gen — Digital Marketing & AI Agency',
    short_name: 'MSR Next Gen',
    description: 'High-converting Meta & Google Ads and 24/7 AI WhatsApp Chatbot Agents for Indian small businesses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fcfdfd',
    theme_color: '#0f6e56',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
