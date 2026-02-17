import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI 이미지 감별 퀴즈",
  description: "AI가 생성한 이미지와 실제 사진을 구별할 수 있나요? 당신의 감별 능력을 테스트해보세요.",
  icons: {
    icon: "/robot.svg",
  },
  openGraph: {
    title: "AI 이미지 감별 퀴즈",
    description: "AI가 생성한 이미지와 실제 사진을 구별할 수 있나요?",
    type: "website",
    locale: "ko_KR",
    siteName: "AI 이미지 감별 퀴즈",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 이미지 감별 퀴즈",
    description: "AI가 생성한 이미지와 실제 사진을 구별할 수 있나요?",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
