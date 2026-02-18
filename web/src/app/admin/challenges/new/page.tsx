'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default function NewChallengePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/admin/login');
                return;
            }
            const res = await fetch(`${API}/admin/challenges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description: description || undefined,
                }),
            });
            if (res.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || '생성 실패');
            }
            const data = await res.json();
            router.push(`/admin/challenges/${data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : '생성 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
                <Link
                    href="/admin"
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    &larr; 목록
                </Link>
                <h1 className="text-2xl font-bold text-white">챌린지 생성</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:outline-none focus:border-purple-400"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        설명 (선택)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 resize-none"
                    />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? '생성 중...' : '챌린지 생성'}
                </button>
            </form>
        </main>
    );
}
