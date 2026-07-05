export type Carrier = { companyName: string; phone: string };

const TIERS = ["Intrastate Only", "Unverified", "Verified", "Regular", "Basic", "Super"];
const PHONE_RE = /(?:\+?1[\s.\-]?)?\(?(\d{3})\)?[\s.\-]?(\d{3})[\s.\-]?(\d{4})/g;

function collapse(s: string): string {
    return s.replace(/\s+/g, " ").trim();
}

function stripTiers(name: string): string {
    let changed = true;
    while (changed) {
        changed = false;
        for (const t of TIERS) {
            const re = new RegExp("\\s*" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "i");
            if (re.test(name)) {
                name = name.replace(re, "").trim();
                changed = true;
            }
        }
    }
    return name;
}

function formatPhone(d: string): string {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function parseCarriers(input: string): Carrier[] {
    let text = (input || "").replace(/\u00a0/g, " ");
    text = text.replace(/\$\s?\d[\d,]*(?:\.\d+)?/g, " ");
    text = text.replace(/\(?\s*\d+(?:\.\d+)?\s*%\s*\)?/g, " ");

    const results: Carrier[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    PHONE_RE.lastIndex = 0;
    while ((match = PHONE_RE.exec(text)) !== null) {
        const digits = match[1] + match[2] + match[3];
        const name = stripTiers(collapse(text.slice(lastIndex, match.index)));
        if (name) results.push({ companyName: name, phone: formatPhone(digits) });
        lastIndex = PHONE_RE.lastIndex;
    }
    return results;
}