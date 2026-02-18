'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AlertModal from '@/components/AlertModal';
import QuestionForm, { QuestionFormState } from '@/components/admin/QuestionForm';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface Question {
    id: string;
    order: number;
    humanImageUrl: string;
    aiImageUrl: string;
    humanAuthor: string | null;
    humanSourceUrl: string | null;
    aiModel: string | null;
}

interface Challenge {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    isActive: boolean;
    questions: Question[];
}

function getToken(router: ReturnType<typeof useRouter>) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        router.push('/admin/login');
        return null;
    }
    return token;
}

async function adminFetch(
    path: string,
    token: string,
    router: ReturnType<typeof useRouter>,
    options?: RequestInit,
) {
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
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `HTTP ${res.status}`);
    }
    return res.json();
}

async function uploadImage(file: File, token: string, router: ReturnType<typeof useRouter>) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    if (res.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
        throw new Error('인증이 만료되었습니다.');
    }
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `업로드 실패 (${res.status})`);
    }
    const data = await res.json();
    return data.url as string;
}

// ── Main Page ──

export default function EditChallengePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

    // Challenge edit fields
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    // New question form
    const [showNewQuestion, setShowNewQuestion] = useState(false);
    const emptyQ = (): QuestionFormState => ({
        order: 1,
        humanImageUrl: '',
        aiImageUrl: '',
        humanAuthor: '',
        humanSourceUrl: '',
        aiModel: '',
        humanImageFile: null,
        aiImageFile: null,
    });
    const [newQ, setNewQ] = useState<QuestionFormState>(emptyQ());
    const [addingQuestion, setAddingQuestion] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editQ, setEditQ] = useState<QuestionFormState>({
        order: 1,
        humanImageUrl: '',
        aiImageUrl: '',
        humanAuthor: '',
        humanSourceUrl: '',
        aiModel: '',
        humanImageFile: null as File | null,
        aiImageFile: null as File | null,
    });
    const [savingQuestion, setSavingQuestion] = useState(false);

    const loadChallenge = useCallback(async () => {
        const token = getToken(router);
        if (!token) return;
        try {
            const data = await adminFetch(`/admin/challenges/${id}`, token, router);
            setChallenge(data);
            setTitle(data.title);
            setSlug(data.slug);
            setDescription(data.description || '');
            setIsActive(data.isActive);
            setNewQ((prev) => ({
                ...prev,
                order: data.questions.length + 1,
            }));
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        loadChallenge();
    }, [loadChallenge, router]);

    const handleSaveChallenge = async () => {
        const token = getToken(router);
        if (!token) return;
        setSaving(true);
        try {
            await adminFetch(`/admin/challenges/${id}`, token, router, {
                method: 'PATCH',
                body: JSON.stringify({
                    title,
                    description: description || undefined,
                    isActive,
                }),
            });
            setAlert({ message: '저장되었습니다.', type: 'success' });
        } catch (err) {
            setAlert({ message: err instanceof Error ? err.message : '저장 실패', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = async () => {
        const token = getToken(router);
        if (!token) return;
        if (!newQ.humanImageUrl && !newQ.humanImageFile || !newQ.aiImageUrl && !newQ.aiImageFile) {
            setAlert({ message: '이미지를 선택하거나 URL을 입력하세요.', type: 'error' });
            return;
        }
        setAddingQuestion(true);
        try {
            const humanImageUrl = newQ.humanImageFile
                ? (await uploadImage(newQ.humanImageFile, token, router))
                : newQ.humanImageUrl;
            const aiImageUrl = newQ.aiImageFile
                ? (await uploadImage(newQ.aiImageFile, token, router))
                : newQ.aiImageUrl;

            await adminFetch(`/admin/challenges/${id}/questions`, token, router, {
                method: 'POST',
                body: JSON.stringify({
                    order: newQ.order,
                    humanImageUrl,
                    aiImageUrl,
                    humanAuthor: newQ.humanAuthor || undefined,
                    humanSourceUrl: newQ.humanSourceUrl || undefined,
                    aiModel: newQ.aiModel || undefined,
                }),
            });
            setShowNewQuestion(false);
            setNewQ({ ...emptyQ(), order: (challenge?.questions.length ?? 0) + 2 });
            await loadChallenge();
        } catch (err) {
            setAlert({ message: err instanceof Error ? err.message : '문제 추가 실패', type: 'error' });
        } finally {
            setAddingQuestion(false);
        }
    };

    const handleDeleteQuestion = (qId: string) => {
        setConfirm({
            message: '이 문제를 삭제하시겠습니까?',
            onConfirm: async () => {
                const token = getToken(router);
                if (!token) return;
                try {
                    await adminFetch(`/admin/questions/${qId}`, token, router, { method: 'DELETE' });
                    await loadChallenge();
                } catch (err) {
                    setAlert({ message: err instanceof Error ? err.message : '삭제 실패', type: 'error' });
                }
            },
        });
    };

    const handleStartEdit = (q: Question) => {
        setEditingId(q.id);
        setEditQ({
            order: q.order,
            humanImageUrl: q.humanImageUrl,
            aiImageUrl: q.aiImageUrl,
            humanAuthor: q.humanAuthor || '',
            humanSourceUrl: q.humanSourceUrl || '',
            aiModel: q.aiModel || '',
            humanImageFile: null,
            aiImageFile: null,
        });
    };

    const handleSaveQuestion = async () => {
        if (!editingId) return;
        const token = getToken(router);
        if (!token) return;
        setSavingQuestion(true);
        try {
            const humanImageUrl = editQ.humanImageFile
                ? await uploadImage(editQ.humanImageFile, token, router)
                : editQ.humanImageUrl;
            const aiImageUrl = editQ.aiImageFile
                ? await uploadImage(editQ.aiImageFile, token, router)
                : editQ.aiImageUrl;
            await adminFetch(`/admin/questions/${editingId}`, token, router, {
                method: 'PATCH',
                body: JSON.stringify({
                    order: editQ.order,
                    humanImageUrl,
                    aiImageUrl,
                    humanAuthor: editQ.humanAuthor || undefined,
                    humanSourceUrl: editQ.humanSourceUrl || undefined,
                    aiModel: editQ.aiModel || undefined,
                }),
            });
            setEditingId(null);
            setAlert({ message: '저장되었습니다.', type: 'success' });
            await loadChallenge();
        } catch (err) {
            setAlert({ message: err instanceof Error ? err.message : '저장 실패', type: 'error' });
        } finally {
            setSavingQuestion(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-gray-300">로딩 중...</p>
            </main>
        );
    }

    if (error || !challenge) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-red-400">{error || '챌린지를 찾을 수 없습니다.'}</p>
            </main>
        );
    }

    return (
        <>
        {alert && <AlertModal message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        {confirm && <AlertModal message={confirm.message} type="error" onClose={() => setConfirm(null)} onConfirm={confirm.onConfirm} />}
        <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <Link
                    href="/admin"
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    &larr; 목록
                </Link>
                <h1 className="text-2xl font-bold text-white">챌린지 편집</h1>
            </div>

            {/* Challenge Info */}
            <section className="p-6 rounded-xl border border-purple-500/20 bg-white/5 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">기본 정보</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">채널ID</label>
                            <input
                                type="text"
                                value={slug}
                                readOnly
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:outline-none focus:border-purple-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 resize-none"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-400">활성 상태</label>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                            }`}
                        >
                            {isActive ? '활성' : '비활성'}
                        </button>
                    </div>
                    <button
                        onClick={handleSaveChallenge}
                        disabled={saving}
                        className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
                    >
                        {saving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </section>

            {/* Questions */}
            <section className="p-6 rounded-xl border border-purple-500/20 bg-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">
                        문제 ({challenge.questions.length}개)
                    </h2>
                    <button
                        onClick={() => setShowNewQuestion(!showNewQuestion)}
                        className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                    >
                        {showNewQuestion ? '취소' : '+ 문제 추가'}
                    </button>
                </div>

                {/* New Question Form */}
                {showNewQuestion && (
                    <div className="p-4 rounded-lg border border-purple-500/30 bg-white/5 mb-6">
                        <QuestionForm
                            value={newQ}
                            onChange={setNewQ}
                            onSubmit={handleAddQuestion}
                            loading={addingQuestion}
                            submitLabel="문제 추가"
                        />
                    </div>
                )}

                {/* Existing Questions */}
                {challenge.questions.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">문제가 없습니다.</p>
                ) : (
                    <div className="space-y-3">
                        {challenge.questions.map((q) => (
                            <div key={q.id} className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
                                <div className="flex items-center gap-4 p-4">
                                    <span className="text-purple-400 font-mono font-bold text-lg w-8 text-center">
                                        {q.order}
                                    </span>
                                    <div className="flex gap-2">
                                        <Image
                                            width={64}
                                            height={64}
                                            src={q.humanImageUrl}
                                            alt="Human"
                                            className="h-16 w-16 rounded object-cover border border-green-500/30"
                                            title="Human"
                                        />
                                        <Image
                                            width={64}
                                            height={64}
                                            src={q.aiImageUrl}
                                            alt="AI"
                                            className="h-16 w-16 rounded object-cover border border-red-500/30"
                                            title="AI"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-300 truncate">
                                        <span className="text-green-400">{q.humanAuthor || 'Unknown'}</span>
                                        <span className="text-gray-400 ml-2">vs</span>
                                        <span className="text-red-400 ml-2">{q.aiModel || 'Unknown'}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => editingId === q.id ? setEditingId(null) : handleStartEdit(q)}
                                            className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/30 transition-colors"
                                        >
                                            {editingId === q.id ? '닫기' : '편집'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuestion(q.id)}
                                            className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 transition-colors"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>

                                {editingId === q.id && (
                                    <div className="px-4 pb-4 border-t border-white/10 pt-4">
                                        <QuestionForm
                                            value={editQ}
                                            onChange={setEditQ}
                                            onSubmit={handleSaveQuestion}
                                            loading={savingQuestion}
                                            submitLabel="저장"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
        </>
    );
}
