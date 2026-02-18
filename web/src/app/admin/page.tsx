'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AlertModal from '@/components/AlertModal';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface Challenge {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    isActive: boolean;
    order: number;
    createdAt: string;
    _count: { questions: number };
}

function useAdminFetch() {
    const router = useRouter();

    return async (path: string, options?: RequestInit) => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            throw new Error('인증이 필요합니다.');
        }
        const res = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options?.headers,
            },
        });
        if (res.status === 401) {
            localStorage.removeItem('adminToken');
            router.push('/admin/login');
            throw new Error('인증이 만료되었습니다.');
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const adminFetch = useAdminFetch();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

    const loadChallenges = async () => {
        try {
            const data = await adminFetch('/admin/challenges');
            setChallenges(data);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        loadChallenges();
    }, []);

    const handleDelete = (id: string, title: string) => {
        setConfirm({
            message: `"${title}" 챌린지를 삭제하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await adminFetch(`/admin/challenges/${id}`, { method: 'DELETE' });
                    setChallenges((prev) => prev.filter((c) => c.id !== id));
                } catch (err) {
                    setAlert({ message: err instanceof Error ? err.message : '삭제 실패', type: 'error' });
                }
            },
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-gray-300">로딩 중...</p>
            </main>
        );
    }

    return (
        <>
        {alert && <AlertModal message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        {confirm && <AlertModal message={confirm.message} type="error" onClose={() => setConfirm(null)} onConfirm={confirm.onConfirm} />}
        <main className="min-h-screen px-4 sm:px-10 py-12 max-w-[95%] mx-auto">
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-3xl font-bold text-white">어드민 페이지</h1>
                <div className="flex gap-3">
                    <Link
                        href="/admin/challenges/new"
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                    >
                        + 챌린지 생성
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm transition-colors"
                    >
                        로그아웃
                    </button>
                </div>
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {challenges.length === 0 ? (
                <p className="text-gray-400 text-center py-12">챌린지가 없습니다.</p>
            ) : (
                <div className="rounded-xl border border-purple-500/20 overflow-x-auto">
                    <table className="w-full min-w-[640px] table-fixed">
                        <thead>
                            <tr className="border-b border-purple-500/20 bg-white/5 text-left text-xs text-gray-500 uppercase">
                                <th className="w-20 px-4 py-3 text-center">순번</th>
                                <th className="w-64 px-4 py-3">제목</th>
                                <th className="w-72 px-4 py-3">설명</th>
                                <th className="w-20 px-4 py-3 text-center">문제</th>
                                <th className="w-20 px-4 py-3 text-center">상태</th>
                                <th className="w-32 px-4 py-3 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {challenges.map((c, i) => (
                                <tr
                                    key={c.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-white truncate">
                                        {c.title}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400 truncate">
                                        {c.description || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300 text-center">
                                        {c._count.questions}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                c.isActive
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}
                                        >
                                            {c.isActive ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <Link
                                                href={`/admin/challenges/${c.id}`}
                                                className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30 transition-colors"
                                            >
                                                편집
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(c.id, c.title)}
                                                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
        </>
    );
}
