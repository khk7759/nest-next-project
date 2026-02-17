'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuizResultProps {
    score: number;
    questionCount: number;
    timeTakenMs?: number;
    onRetry: () => void;
}

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) return `${minutes}분 ${seconds}초`;
    return `${seconds}초`;
}

export default function QuizResult({ score, questionCount, timeTakenMs, onRetry }: QuizResultProps) {
    const [copied, setCopied] = useState(false);

    const timeText = timeTakenMs != null ? `\n⏱ ${formatTime(timeTakenMs)}` : '';
    const resultText = `🧠 AI 이미지 감별 퀴즈\n${questionCount}문제 중 ${score}문제 정답! (${Math.round((score / questionCount) * 100)}%)${timeText}\n\n나도 도전하기 → ${typeof window !== 'undefined' ? window.location.origin : ''}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(resultText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            // 클립보드 접근 실패 시 fallback
            console.error('클립보드 복사 실패:', error);
            // 안드로이드에서 실패하면 사용자에게 알림
            alert('복사에 실패했습니다. 브라우저 권한을 확인해주세요.');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                const shareData = {
                    title: 'AI 이미지 감별 퀴즈',
                    text: `${questionCount}문제 중 ${score}문제 정답! (${Math.round((score / questionCount) * 100)}%)`,
                    url: typeof window !== 'undefined' ? window.location.href : '',
                };
                await navigator.share(shareData);
            } catch (error) {
                // 사용자가 공유를 취소한 경우 (AbortError)는 조용히 무시
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('공유 실패:', error);
                    // 공유 실패 시 클립보드에 복사
                    handleCopyLink();
                }
            }
        } else {
            // Web Share API를 지원하지 않는 브라우저는 클립보드에 복사
            handleCopyLink();
        }
    };

    const percentage = Math.round((score / questionCount) * 100);

    return (
        <main className="min-h-[100dvh] p-8 flex flex-col items-center justify-center gap-6">
            <h1 className="text-3xl font-bold text-white">완료!</h1>
            <p className="text-5xl font-extrabold text-white">
                {score} / {questionCount}
            </p>
            <p className="text-lg text-gray-400">
                정답률 {percentage}%
            </p>
            {timeTakenMs != null && (
                <p className="text-sm text-gray-500">
                    소요 시간: {formatTime(timeTakenMs)}
                </p>
            )}
            <div className="flex gap-4">
                <button
                    onClick={onRetry}
                    className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                >
                    다시 풀기
                </button>
                <Link
                    href="/"
                    className="px-6 py-2 rounded-lg border border-purple-500/30 hover:bg-white/10 transition-colors"
                >
                    목록으로
                </Link>
            </div>
            <div className="flex gap-3 mt-4">
                <button
                    onClick={handleCopyLink}
                    className="px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/15 transition-colors text-sm"
                >
                    {copied ? '복사됨!' : '결과 복사'}
                </button>
                <button
                    onClick={handleShare}
                    className="px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/15 transition-colors text-sm"
                >
                    공유하기
                </button>
            </div>
        </main>
    );
}
