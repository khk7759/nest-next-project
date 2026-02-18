'use client';

export default function ImageUploadField({
    label,
    previewUrl,
    onFileSelect,
    onUrlChange,
}: {
    label: string;
    previewUrl: string;
    onFileSelect: (file: File, blobUrl: string) => void;
    onUrlChange: (url: string) => void;
}) {
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const blobUrl = URL.createObjectURL(file);
        onFileSelect(file, blobUrl);
        e.target.value = '';
    };

    return (
        <div>
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={previewUrl}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-purple-400"
                />
                <label className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/30 transition-colors cursor-pointer">
                    선택
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
            </div>
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt={label}
                    className="mt-2 h-24 rounded-lg object-cover border border-white/10"
                />
            )}
        </div>
    );
}
