import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin - AI 이미지 감별 퀴즈',
    description: '퀴즈 관리 페이지',
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}