import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MSR Next Gen — Digital Marketing & AI for Indian Businesses';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #093a2e 0%, #0f6e56 60%, #18a58f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 90px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              background: '#ffffff',
              color: '#0f6e56',
              fontWeight: 900,
              fontSize: 32,
              padding: '12px 24px',
              borderRadius: '16px',
              letterSpacing: '1px',
            }}
          >
            MSR NEXT GEN
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '999px',
              padding: '8px 22px',
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Digital Marketing & 24/7 AI WhatsApp Agents
          </div>
        </div>

        {/* Value Proposition Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: '1000px',
              letterSpacing: '-0.02em',
            }}
          >
            Get More Customers For Your Business — Ads & AI That Actually Deliver Results.
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#d7f7ee',
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Built for ambitious Indian local businesses, retail stores, and D2C brands.
          </div>
        </div>

        {/* Footer Proof Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 22, color: '#eaf6f2' }}>
            <span>✓ Meta & Google Ads</span>
            <span>•</span>
            <span>✓ 24/7 AI WhatsApp Agents</span>
            <span>•</span>
            <span>✓ 1+ Year Social Media Growth</span>
          </div>
          <div
            style={{
              background: '#25D366',
              color: '#000000',
              fontWeight: 700,
              fontSize: 22,
              padding: '12px 26px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            WhatsApp Us Now
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
