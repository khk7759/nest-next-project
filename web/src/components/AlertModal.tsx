'use client';

interface AlertModalProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    onConfirm?: () => void;
}

export default function AlertModal({ message, type = 'info', onClose, onConfirm }: AlertModalProps) {
    const iconMap = { success: '✓', error: '✕', info: 'ℹ' };
    const colorMap = {
        success: 'text-green-400',
        error: 'text-red-400',
        info: 'text-purple-400',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm mx-4 rounded-2xl border bg-gray-900 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl ${colorMap[type]}`}>
                    <span className="text-lg font-bold">{iconMap[type]}</span>
                    <p className="text-sm font-medium">{message}</p>
                </div>
                {onConfirm ? (
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-medium transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className="flex-1 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                        >
                            확인
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onClose}
                        className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                    >
                        확인
                    </button>
                )}
            </div>
        </div>
    );
}
