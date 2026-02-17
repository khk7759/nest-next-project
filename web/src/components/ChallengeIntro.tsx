'use client';

import { useEffect, useState } from 'react';

interface ChallengeIntroProps {
    onStart: () => void;
}

const TITLE_TEXT = '진짜 사진을\n구별할 수 있나요?';
const TYPING_SPEED = 80;

export default function ChallengeIntro({ onStart }: ChallengeIntroProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [typingDone, setTypingDone] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            i++;
            setDisplayedText(TITLE_TEXT.slice(0, i));
            if (i >= TITLE_TEXT.length) {
                clearInterval(timer);
                setTypingDone(true);
                setTimeout(() => setShowButton(true), 700);
            }
        }, TYPING_SPEED);
        return () => clearInterval(timer);
    }, []);

    const lines = displayedText.split('\n');

    return (
        <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,80,255,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,80,120,0.1),transparent_50%)]" />

            <div className="relative z-10 text-center px-6 max-w-2xl">
                <p className="text-sm font-medium tracking-widest text-purple-400 uppercase mb-4">
                    AI vs Human
                </p>
                <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight h-[120px] sm:h-[168px]">
                    {lines[0]}
                    {lines.length > 1 && (
                        <>
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {lines[1]}
                            </span>
                        </>
                    )}
                    {!typingDone && (
                        <span className="inline-block w-[3px] h-[1em] bg-purple-400 ml-1 animate-pulse align-baseline" />
                    )}
                </h1>
                <div
                    className={`transition-all duration-700 ease-out ${
                        typingDone
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-6'
                    }`}
                >
                    <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                        AI가 생성한 이미지와 실제 사진을 비교하고, 당신의 감별 능력을 테스트해보세요.
                    </p>
                </div>
                <div
                    className={`transition-all duration-700 ease-out ${
                        showButton
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-6'
                    }`}
                >
                    <button
                        onClick={onStart}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-lg font-semibold rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                    >
                        챌린지 시작하기
                    </button>
                </div>
            </div>
        </main>
    );
}
