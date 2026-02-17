'use client';

import { useState } from 'react';

interface NicknameInputProps {
    challengeTitle: string;
    onSubmit: (nickname: string) => void;
    loading?: boolean;
}

export default function NicknameInput({ challengeTitle, onSubmit, loading }: NicknameInputProps) {
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(nickname.trim());
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <form onSubmit={handleSubmit} className="w-full max-w-md text-center space-y-8">
                <div>
                    <p className="text-sm font-medium tracking-widest text-purple-400 uppercase mb-3">
                        {challengeTitle}
                    </p>
                    <h1 className="text-3xl font-extrabold text-white mb-2">
                        닉네임을 입력하세요
                    </h1>
                    <p className="text-gray-400 text-sm">
                        랭킹에 표시될 이름이에요 (최대 20자)
                    </p>
                </div>

                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    placeholder="닉네임"
                    autoFocus
                    className="w-full px-5 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-gray-500 text-center text-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                />

                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={!nickname.trim() || loading}
                        className="w-full px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? '준비 중...' : '시작하기'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onSubmit('')}
                        disabled={loading}
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        닉네임 없이 시작
                    </button>
                </div>
            </form>
        </main>
    );
}
