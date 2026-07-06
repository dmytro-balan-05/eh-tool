"use client";
import { input, readonly, label, card } from "./styles";

type Props = {
    vin: string;
    setVin: (v: string) => void;
    year: string;
    make: string;
    model: string;
    decoding: boolean;
    decodeError: string;
    vehicle: string;
    onDecode: () => void;
};

export function VehicleSection({
                                   vin, setVin, year, make, model, decoding, decodeError, vehicle, onDecode,
                               }: Props) {
    return (
        <section className={card}>
            <label className={label}>VIN</label>
            <div className="flex gap-2">
                <input
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onBlur={onDecode}
                    onKeyDown={(e) => e.key === "Enter" && onDecode()}
                    className={input + " font-mono uppercase"}
                    placeholder="5XYP34HC4LG026918"
                />
                <button
                    onClick={onDecode}
                    disabled={decoding}
                    className="whitespace-nowrap rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                    {decoding ? "…" : "Decode"}
                </button>
            </div>
            {decodeError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{decodeError}</p>}
            {vehicle && !decodeError && (
                <p className="mt-1.5 text-xs text-teal-600 dark:text-teal-400">✓ {vehicle}</p>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
                <div>
                    <label className={label}>Year</label>
                    <input value={year} readOnly tabIndex={-1} className={readonly} />
                </div>
                <div>
                    <label className={label}>Make</label>
                    <input value={make} readOnly tabIndex={-1} className={readonly} />
                </div>
                <div>
                    <label className={label}>Model</label>
                    <input value={model} readOnly tabIndex={-1} className={readonly} />
                </div>
            </div>
        </section>
    );
}