"use client";
import { input, label, card } from "./styles";

type Props = {
    raw: string;
    setRaw: (v: string) => void;
    detected: number;
};

export function CarriersSection({ raw, setRaw, detected }: Props) {
    return (
        <section className={card}>
            <div className="mb-1 flex items-center justify-between">
                <label className={label + " mb-0"}>Carriers - paste from ACP</label>
                {detected > 0 && (
                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
            Detected: {detected}
          </span>
                )}
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