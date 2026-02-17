'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Question {
    id: string;
    order: number;
    imageA: string;
    imageB: string;
}

interface CheckResult {
    isCorrect: boolean;
    aiImageUrl: string;
    humanImageUrl: string;
}

interface QuizQuestionProps {
    question: Question;
    onNext: (isCorrect: boolean, selected: 'A' | 'B') => void;
    isLast?: boolean;
}

export default function QuizQuestion({ question, onNext, isLast }: QuizQuestionProps) {
    const [selected, setSelected] = useState<'A' | 'B' | null>(null);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [checking, setChecking] = useState(false);

    const handleSelect = async (choice: 'A' | 'B') => {
        if (selected) return;
        setSelected(choice);
        setChecking(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/games/check-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: question.id,
                    selected: choice,
                }),
            });
            const data: CheckResult = await res.json();
            setResult(data);
            if (!isLast) {
                setTimeout(() => {
                    setSelected(null);
                    setResult(null);
                    onNext(data.isCorrect, choice);
                }, 1000);
            }
        } catch {
            setResult(null);
        } finally {
            setChecking(false);
        }
    };

    const getBorderClass = (choice: 'A' | 'B') => {
        if (!selected) return 'border-transparent';
        if (selected !== choice) return 'border-transparent opacity-50';
        if (!result) return 'border-purple-500';
        return result.isCorrect
            ? 'border-green-500'
            : 'border-red-500';
    };

    return (
        <>
            <p className="text-lg font-medium mb-4 text-center text-gray-300">
                사람이 찍은 이미지를 골라주세요
            </p>
            <div className="grid grid-cols-2 gap-6">
                <button
                    onClick={() => handleSelect('A')}
                    disabled={!!selected}
                    className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-all ${!selected ? 'hover:scale-[1.02]' : ''} ${getBorderClass('A')}`}
                >
                    <Image
                        src={question.imageA}
                        alt={`문제 ${question.order} - A`}
                        fill
                        className="object-cover quiz-image"
                        draggable={false}
                    />
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                        A
                    </span>
                </button>
                <button
                    onClick={() => handleSelect('B')}
                    disabled={!!selected}
                    className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-all ${!selected ? 'hover:scale-[1.02]' : ''} ${getBorderClass('B')}`}
                >
                    <Image
                        src={question.imageB}
                        alt={`문제 ${question.order} - B`}
                        fill
                        className="object-cover quiz-image"
                        draggable={false}
                    />
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                        B
                    </span>
                </button>
            </div>

            {result && (
                <div className="mt-6 text-center space-y-4">
                    <p className={`text-xl font-bold ${result.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {result.isCorrect ? '정답!' : '오답!'}
                    </p>
                    {isLast && (
                        <button
                            onClick={() => {
                                setSelected(null);
                                setResult(null);
                                onNext(result.isCorrect, selected!);
                            }}
                            className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                        >
                            결과보기
                        </button>
                    )}
                </div>
            )}

            {checking && (
                <p className="mt-6 text-center text-gray-400">확인 중...</p>
            )}
        </>
    );
}
