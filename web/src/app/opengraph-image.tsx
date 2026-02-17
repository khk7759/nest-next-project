import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI 이미지 감별 퀴즈';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '24px',
                    }}
                >
                    <span style={{ fontSize: '72px' }}>🤖</span>
                    <span style={{ fontSize: '48px', color: '#a855f7' }}>vs</span>
                    <span style={{ fontSize: '72px' }}>📷</span>
                </div>
                <div
                    style={{
                        fontSize: '56px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        marginBottom: '16px',
                    }}
                >
                    AI 이미지 감별 퀴즈
                </div>
                <div
                    style={{
                        fontSize: '28px',
                        color: '#a78bfa',
                        marginBottom: '40px',
                    }}
                >
                    AI가 만든 이미지 vs 실제 사진, 구별할 수 있나요?
                </div>
                <div
                    style={{
                        display: 'flex',
                        padding: '12px 32px',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: '#ffffff',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    }}
                >
                    도전하기
                </div>
            </div>
        ),
        { ...size }
    );
}
