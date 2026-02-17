'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QuizQuestion from '../../../components/QuizQuestion';
import QuizResult from '../../../components/QuizResult';

interface Question {
    id: string;
    order: number;
    imageA: string;
    imageB: string;
}

interface ChallengeDetail {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    questions: Question[];
    createdAt: string;
}

export default function ChallengeDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [finalTime, setFinalTime] = useState<number | undefined>(undefined);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [answers, setAnswers] = useState<{ questionId: string; selected: 'A' | 'B' }[]>([]);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        const savedSessionId = sessionStorage.getItem('gameSessionId');
        if (savedSessionId) {
            setSessionId(savedSessionId);
            startTimeRef.current = Date.now();
        }

        fetch(`http://localhost:3001/api/challenges/${slug}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                data.questions.sort(() => Math.random() - 0.5);
                setChallenge(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [slug]);

    const submitAllAnswers = async (allAnswers: { questionId: string; selected: 'A' | 'B' }[], timeTakenMs: number) => {
        if (!sessionId) return;
        try {
            await fetch(`http://localhost:3001/api/games/${sessionId}/answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: allAnswers, timeTakenMs }),
            });
        } catch {
            // 제출 실패해도 결과 화면은 보여줌
        }
    };

    const handleNext = (isCorrect: boolean, selectedChoice: 'A' | 'B') => {
        if (!challenge) return;

        const question = challenge.questions[currentIndex];
        const newAnswer = { questionId: question.id, selected: selectedChoice };
        setAnswers((prev) => [...prev, newAnswer]);

        if (isCorrect) setScore((prev) => prev + 1);
        if (currentIndex < challenge.questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            const timeTakenMs = Date.now() - startTimeRef.current;
            setFinalTime(timeTakenMs);
            const allAnswers = [...answers, newAnswer];
            submitAllAnswers(allAnswers, timeTakenMs);
            setFinished(true);
        }
    };

    const handleRetry = async () => {
        if (challenge) {
            challenge.questions.sort(() => Math.random() - 0.5);
        }
        setCurrentIndex(0);
        setScore(0);
        setFinished(false);
        setAnswers([]);

        // 새 세션 생성
        try {
            const res = await fetch(`http://localhost:3001/api/games/${slug}/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            if (res.ok) {
                const data = await res.json();
                setSessionId(data.sessionId);
                sessionStorage.setItem('gameSessionId', data.sessionId);
                startTimeRef.current = Date.now();
            }
        } catch {
            // 세션 생성 실패해도 퀴즈는 진행
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-300">로딩 중...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center flex-col gap-4">
                <p className="text-lg text-red-400">에러: {error}</p>
                <Link href="/" className="text-purple-400 underline">
                    목록으로 돌아가기
                </Link>
            </main>
        );
    }

    if (!challenge) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-300">챌린지를 찾을 수 없습니다.</p>
            </main>
        );
    }

    if (finished) {
        return (
            <QuizResult
                score={score}
                questionCount={challenge.questions.length}
                timeTakenMs={finalTime}
                onRetry={handleRetry}
            />
        );
    }

    const question = challenge.questions[currentIndex];
    const total = challenge.questions.length;

    return (
        <main className="min-h-screen p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                        {currentIndex + 1} / {total}
                    </span>
                    <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-purple-400 transition-colors border border-gray-700 hover:border-purple-500/50 px-3 py-1 rounded-lg"
                    >
                        목록
                    </Link>
                </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2 mb-8">
                <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
            </div>

            <QuizQuestion question={question} onNext={handleNext} isLast={currentIndex === total - 1} />
        </main>
    );
}
