export type ParsedRequest = {
    vin: string | null;
    text: string;
    tags: string[];
};

export const REQUEST_TAGS = [
    "ETA pickup",
    "ETA delivery",
    "Title",
    "Damage / photos",
    "Payment",
    "Still interested",
    "Call customer",
    "Change address",
    "Forward phone",
    "ACH reminder",
    "Unload problem",
    "Cancellation",
] as const;

function looksVin(t: string): boolean {
    return /^[A-HJ-NPR-Z0-9]{11,17}$/i.test(t) && /\d/.test(t) && /[A-Z]/i.test(t);
}

function suggestTags(t: string): string[] {
    const tags = new Set<string>();
    const hasTitle = /\btitle\w*/i.test(t);

    if (hasTitle) tags.add("Title");
    if (/\bdeliver\w*/i.test(t) || /\barrival\b/i.test(t)) tags.add("ETA delivery");
    if (
        !hasTitle &&
        (/\b(pick\s?up|picked\s?up|pickup|p\/?u)\b/i.test(t) || /\bappt\b|\bappointment\b/i.test(t))
    )
        tags.add("ETA pickup");
    if (/\b(damage\w*|photo\w*|pictur\w*|pics?|stolen)\b/i.test(t)) tags.add("Damage / photos");
    if (/\b(payment\w*|invoice\w*|balance)\b/i.test(t) && !/\bach\b/i.test(t)) tags.add("Payment");
    if (/\binterested\b/i.test(t)) tags.add("Still interested");
    if (/\bcall\b.*\bcustomer\b|\bcontact\b.*\bcustomer\b/i.test(t)) tags.add("Call customer");
    if (/\b(change|update|new|different)\b.*\baddress\b|\baddress\b.*\b(change|update)/i.test(t))
        tags.add("Change address");
    if (
        /\b(forward|share|provide|send|correct)\b.*\b(phone|number|ph#|contact)\b|\bcontact\s+ph/i.test(t)
    )
        tags.add("Forward phone");
    if (/\bach\b/i.test(t)) tags.add("ACH reminder");
    if (/\b(unload\w*|offload\w*)\b/i.test(t)) tags.add("Unload problem");
    if (/\bcancel\w*\b/i.test(t)) tags.add("Cancellation");

    return [...tags];
}

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

function extractVins(line: string): { vins: string[]; rest: string } {
    const tokens = line.trim().split(/\s+/);
    const vins: string[] = [];
    let i = 0;
    while (i < tokens.length) {
        const t = tokens[i].replace(/[,+]+$/, "");
        if (tokens[i] === "+") { i++; continue; }
        if (looksVin(t)) {
            vins.push(t.toUpperCase());
            i++;
            if (tokens[i] === "+") i++;
            continue;
        }
        break;
    }
    if (vins.length > 0) return { vins, rest: tokens.slice(i).join(" ").trim() };

    const matches = line.match(/\b[A-HJ-NPR-Z0-9]{11,17}\b/gi);
    if (matches) {
        const found = matches.filter(looksVin);
        if (found.length > 0) {
            let rest = line;
            for (const f of found) rest = rest.replace(f, "");
            return { vins: found.map((x) => x.toUpperCase()), rest: rest.replace(/\s+/g, " ").trim() };
        }
    }
    return { vins: [], rest: line.trim() };
}

export function parseRequestsBlock(block: string): ParsedRequest[] {
    const out: ParsedRequest[] = [];
    for (const raw of block.split("\n")) {
        if (isJunk(raw)) continue;
        const { vins, rest } = extractVins(raw);
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