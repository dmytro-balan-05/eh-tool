"use client";
import { input, label, card } from "./styles";

type Props = {
    raw: string;
    setRaw: (v: string) => void;
    detected: number;
    phones: string;
    onCopyPhones: () => void;
    copiedPhones: boolean;
};

export function CarriersSection({ raw, setRaw, detected, phones, onCopyPhones, copiedPhones }: Props) {
    return (
        <section className={card}>
            <div className="mb-1 flex items-center justify-between">
                <label className={label + " mb-0"}>Carriers - paste from ACP</label>
                <div className="flex items-center gap-2">
                    {detected > 0 && (
                        <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
              Detected: {detected}
            </span>
                    )}
                    {phones && (
                        <button
                            type="button"
                            onClick={onCopyPhones}
                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            {copiedPhones ? "Copied ✓" : "Copy ph#s"}
                        </button>
                    )}
                </div>
            </div>
            <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                onFocus={(e) => e.target.select()}
                className={input + " h-32 resize-y font-mono"}
                placeholder="TVM Inc Regular   $500.00   (516) 324-8989"
            />
        </section>
    );
}