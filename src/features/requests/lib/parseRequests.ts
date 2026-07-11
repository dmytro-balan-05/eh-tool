export type ParsedRequest = {
    vin: string | null;
    text: string;
    tags: string[];
};

export const REQUEST_TAGS = [
    "ETA pickup",
    "ETA delivery",
    "Damage / photos",
    "Payment",
    "Still interested",
    "Call customer",
    "Change address",
    "Forward phone",
    "ACH reminder",
    "Unload problem",
] as const;

const TIME = /\b(eta|when|today|tomorrow|date|time|status|how long|long|arrive|arriving|delay|delayed|soon)\b/i;

const TAG_RULES: { tag: string; test: (t: string) => boolean }[] = [
    { tag: "ETA delivery", test: (t) => /\bdeliver\w*/i.test(t) && TIME.test(t) },
    { tag: "ETA pickup", test: (t) => /\b(pick\s?up|pickup|p\/?u)\b/i.test(t) && TIME.test(t) },
    { tag: "Damage / photos", test: (t) => /\b(damage\w*|photo\w*|pictur\w*|pics?)\b/i.test(t) },
    { tag: "Payment", test: (t) => /\b(payment\w*|invoice\w*|balance)\b/i.test(t) && !/\bach\b/i.test(t) },
    { tag: "Still interested", test: (t) => /\binterested\b/i.test(t) },
    { tag: "Call customer", test: (t) => /\bcall\b.*\bcustomer\b|\bcontact\b.*\bcustomer\b/i.test(t) },
    { tag: "Change address", test: (t) => /\b(change|update|new|different)\b.*\baddress\b|\baddress\b.*\b(change|update)/i.test(t) },
    { tag: "Forward phone", test: (t) => /\b(forward|share|provide|send)\b.*\b(phone|number|contact)\b/i.test(t) },
    { tag: "ACH reminder", test: (t) => /\bach\b/i.test(t) },
    { tag: "Unload problem", test: (t) => /\b(unload\w*|offload\w*)\b/i.test(t) },
];

function findVin(text: string): string | null {
    for (const t of text.split(/\s+/)) {
        if (/^[A-HJ-NPR-Z0-9]{11,17}$/i.test(t)) return t.toUpperCase();
    }
    return null;
}

function suggestTags(text: string): string[] {
    return TAG_RULES.filter((r) => r.test(text)).map((r) => r.tag);
}

export function parseRequestLine(line: string): ParsedRequest | null {
    const raw = line.trim();
    if (!raw) return null;
    const vin = findVin(raw);
    const text = vin ? raw.replace(vin, "").replace(/\s+/g, " ").trim() : raw;
    return { vin, text: text || raw, tags: suggestTags(raw) };
}

export function parseRequestsBlock(block: string): ParsedRequest[] {
    return block
        .split("\n")
        .map(parseRequestLine)
        .filter((r): r is ParsedRequest => r !== null);
}