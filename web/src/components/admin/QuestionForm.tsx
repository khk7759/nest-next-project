'use client';

import ImageUploadField from './ImageUploadField';

export interface QuestionFormState {
    order: number;
    humanImageUrl: string;
    aiImageUrl: string;
    humanAuthor: string;
    humanSourceUrl: string;
    aiModel: string;
    humanImageFile: File | null;
    aiImageFile: File | null;
}

export default function QuestionForm({
    value,
    onChange,
    onSubmit,
    loading,
    submitLabel,
}: {
    value: QuestionFormState;
    onChange: (v: QuestionFormState) => void;
    onSubmit: () => void;
    loading: boolean;
    submitLabel: string;
}) {
    return (
        <div className="space-y-3">
            <ImageUploadField
                label="Human 이미지"
                previewUrl={value.humanImageUrl}
                onFileSelect={(file, blobUrl) => onChange({ ...value, humanImageFile: file, humanImageUrl: blobUrl })}
                onUrlChange={(url) => onChange({ ...value, humanImageUrl: url, humanImageFile: null })}
            />
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">작가 (선택)</label>
                    <input
                        type="text"
                        value={value.humanAuthor}
                        onChange={(e) => onChange({ ...value, humanAuthor: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">출처 URL (선택)</label>
                    <input
                        type="text"
                        value={value.humanSourceUrl}
                        onChange={(e) => onChange({ ...value, humanSourceUrl: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                </div>
            </div>
            <ImageUploadField
                label="AI 이미지"
                previewUrl={value.aiImageUrl}
                onFileSelect={(file, blobUrl) => onChange({ ...value, aiImageFile: file, aiImageUrl: blobUrl })}
                onUrlChange={(url) => onChange({ ...value, aiImageUrl: url, aiImageFile: null })}
            />
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">AI 모델 (선택)</label>
                    <input
                        type="text"
                        value={value.aiModel}
                        onChange={(e) => onChange({ ...value, aiModel: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">순서</label>
                    <input
                        type="number"
                        min={1}
                        value={value.order}
                        onChange={(e) => onChange({ ...value, order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                </div>
            </div>
            <button
                onClick={onSubmit}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
            >
                {loading ? '처리 중...' : submitLabel}
            </button>
        </div>
    );
}
