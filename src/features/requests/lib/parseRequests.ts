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
    "Title",
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
    { tag: "Title", test: (t) => /\btitle\w*/i.test(t) },
];

const VIN = /^[A-HJ-NPR-Z0-9]{11,17}$/i;

const JUNK = [
    /^\d+\s+likes?\s+reactions?\.?$/i,
    /^\d+\s+reactions?\.?$/i,
    /^(reply|seen|edited|forwarded)\.?$/i,
    /^like\.?$/i,
];

function isJunk(line: string): boolean {
    const s = line.trim();
    return !s || JUNK.some((re) => re.test(s));
}

function suggestTags(text: string): string[] {
    return TAG_RULES.filter((r) => r.test(text)).map((r) => r.tag);
}

function extractLeadingVins(line: string): { vins: string[]; rest: string } {
    const tokens = line.trim().split(/\s+/);
    const vins: string[] = [];
    let i = 0;
    while (i < tokens.length) {
        const t = tokens[i].replace(/[,+]+$/, "");
        if (tokens[i] === "+") { i++; continue; }
        if (VIN.test(t)) {
            vins.push(t.toUpperCase());
            i++;
            if (tokens[i] === "+") i++;
            continue;
        }
        break;
    }
    const rest = tokens.slice(i).join(" ").trim();
    return { vins, rest };
}

export function parseRequestsBlock(block: string): ParsedRequest[] {
    const out: ParsedRequest[] = [];
    for (const raw of block.split("\n")) {
        if (isJunk(raw)) continue;
        const { vins, rest } = extractLeadingVins(raw);
        if (vins.length === 0) {
            const text = raw.trim();
            if (text) out.push({ vin: null, text, tags: suggestTags(text) });
            continue;
        }
        const text = rest || raw.trim();
        const tags = suggestTags(text);
        for (const vin of vins) out.push({ vin, text, tags });
    }
    return out;
}

export function parseRequestLine(line: string): ParsedRequest | null {
    const parsed = parseRequestsBlock(line);
    return parsed[0] ?? null;
}