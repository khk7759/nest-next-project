'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChallengeIntro from '../../components/ChallengeIntro';
import NicknameModal from '../../components/NicknameModal';

interface Challenge {
    id: string;
    title: string;
    slug: string;
    description?: string;
    questionCount: number;
    createdAt: string;
}

export default function ChallengesPage() {
    const router = useRouter();
    const [started, setStarted] = useState(false);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [creatingSession, setCreatingSession] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('challengeStarted') === 'true') {
            setStarted(true);
        }
    }, []);

    useEffect(() => {
        fetch('http://localhost:3001/api/challenges')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => setChallenges(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleNicknameSubmit = async (nickname: string) => {
        if (!selectedChallenge) return;
        setCreatingSession(true);
        try {
            const res = await fetch(`http://localhost:3001/api/games/${selectedChallenge.slug}/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname: nickname || undefined }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            // sessionStorage에 sessionId 저장 후 퀴즈 페이지로 이동
            sessionStorage.setItem('gameSessionId', data.sessionId);
            router.push(`/challenges/${selectedChallenge.slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : '세션 생성 실패');
            setSelectedChallenge(null);
        } finally {
            setCreatingSession(false);
        }
    };

    if (!started) {
        return <ChallengeIntro onStart={() => {
            sessionStorage.setItem('challengeStarted', 'true');
            setStarted(true);
        }} />;
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-300">로딩 중...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-red-400">에러: {error}</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <p className="text-sm font-medium tracking-widest text-purple-400 uppercase mb-3">
                    AI vs Human
                </p>
                <h1 className="text-4xl font-extrabold text-white mb-3">
                    챌린지를 선택하세요
                </h1>
                <p className="text-gray-400">
                    이미지 감별에 도전해보세요
                </p>
            </div>

            {challenges.length === 0 ? (
                <p className="text-gray-400 text-center">챌린지가 없습니다.</p>
            ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {challenges.map((c) => (
                        <li key={c.id}>
                            <button
                                onClick={() => setSelectedChallenge(c)}
                                className="group block w-full text-left rounded-xl border border-purple-500/20 bg-white/5 p-6 hover:bg-purple-500/10 hover:border-purple-400/40 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">
                                        🧠
                                    </div>
                                    <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                                        {c.title}
                                    </h2>
                                </div>
                                {c.description && (
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                        {c.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        📷 {c.questionCount}문제
                                    </span>
                                    <span className="px-2 py-1 rounded-full bg-purple-500/15 text-purple-400 font-medium">
                                        도전하기 →
                                    </span>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedChallenge && (
                <NicknameModal
                    challengeTitle={selectedChallenge.title}
                    onSubmit={handleNicknameSubmit}
                    onClose={() => setSelectedChallenge(null)}
                    loading={creatingSession}
                />
            )}
        </main>
    );
}
