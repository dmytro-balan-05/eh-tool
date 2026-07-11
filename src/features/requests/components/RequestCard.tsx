"use client";
import { REQUEST_TAGS } from "../lib/parseRequests";
import type { RequestRecord, RequestStatus } from "../hooks/useRequests";

const ACP_URL = "https://www.easyhaul.com/eh-acp/order/vin-search";

const STATUS_LABEL: Record<RequestStatus, string> = {
    NEW: "new",
    CALLED_NO_ANSWER: "called — no answer",
    RESOLVED: "resolved",
};

const STATUS_STYLE: Record<RequestStatus, string> = {
    NEW: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    CALLED_NO_ANSWER: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    RESOLVED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};

export function RequestCard({
                                req,
                                onStatus,
                                onToggleTag,
                                onDelete,
                            }: {
    req: RequestRecord;
    onStatus: (id: string, status: RequestStatus) => void;
    onToggleTag: (id: string, tag: string) => void;
    onDelete: (id: string) => void;
}) {
    const resolved = req.status === "RESOLVED";

    return (
        <div
            className={`rounded-xl border bg-white p-3.5 shadow-sm dark:bg-gray-900 ${
                req.status === "CALLED_NO_ANSWER"
                    ? "border-amber-300 dark:border-amber-800"
                    : "border-gray-200 dark:border-gray-800"
            } ${resolved ? "opacity-70" : ""}`}
        >
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {req.vin ? (
                        <a
                        href={`${ACP_URL}/${req.vin}?type=vin`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-teal-50 px-2 py-0.5 font-mono text-xs text-teal-700 hover:underline dark:bg-teal-900/30 dark:text-teal-400"
                        >
                    {req.vin} ↗
                        </a>
                        ) : (
                        <span className="text-xs text-gray-400">no VIN</span>
                        )}
                </div>
                <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[req.status]}`}>
          {STATUS_LABEL[req.status]}
        </span>
            </div>

            <p className={`mb-2.5 text-sm ${resolved ? "text-gray-500 line-through dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
                {req.text}
            </p>

            <div className="mb-2.5 flex flex-wrap gap-1">
                {REQUEST_TAGS.map((tag) => {
                    const on = req.tags.includes(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => onToggleTag(req.id, tag)}
                            className={`rounded px-2 py-0.5 text-[11px] transition ${
                                on
                                    ? "bg-teal-600 text-white"
                                    : "border border-gray-200 text-gray-400 hover:border-gray-300 dark:border-gray-700 dark:text-gray-500"
                            }`}
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-2">
                {req.status !== "CALLED_NO_ANSWER" && !resolved && (
                    <button
                        onClick={() => onStatus(req.id, "CALLED_NO_ANSWER")}
                        className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        No answer
                    </button>
                )}
                {!resolved ? (
                    <button
                        onClick={() => onStatus(req.id, "RESOLVED")}
                        className="rounded-lg border border-green-300 px-2.5 py-1 text-xs text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                    >
                        Resolve
                    </button>
                ) : (
                    <button
                        onClick={() => onStatus(req.id, "NEW")}
                        className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Reopen
                    </button>
                )}
                <button
                    onClick={() => onDelete(req.id)}
                    className="ml-auto rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}