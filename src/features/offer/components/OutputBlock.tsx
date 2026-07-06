"use client";

type OutputBlockProps = {
    label: string;
    text: string;
    keyName: string;
    copied: string | null;
    onCopy: (key: string, text: string) => void;
};

export function OutputBlock({ label, text, keyName, copied, onCopy }: OutputBlockProps) {
    const isCopied = copied === keyName;
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span
                    className={`text-xs ${
                        isCopied ? "text-teal-600 dark:text-teal-400" : "text-gray-400 dark:text-gray-500"
                    }`}
                >
          {isCopied ? "Copied ✓" : "click to copy"}
        </span>
            </div>
            <button
                type="button"
                onClick={() => onCopy(keyName, text)}
                className={`w-full whitespace-pre-wrap rounded-lg border p-3 text-left font-mono text-sm transition ${
                    isCopied
                        ? "border-teal-400 bg-teal-50 text-gray-900 dark:border-teal-600 dark:bg-teal-950 dark:text-gray-100"
                        : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                }`}
            >
                {text}
            </button>
        </div>
    );
}