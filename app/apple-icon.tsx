import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 88,
          background: 'linear-gradient(135deg, #0f6e56 0%, #084334 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 900,
          borderRadius: 36,
          boxShadow: '0 8px 32px rgba(15, 110, 86, 0.4)',
        }}
      >
        <span>MSR</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
