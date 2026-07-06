import Link from "next/link";

function Shot({ src, alt }: { src: string; alt: string }) {
    return (
        <img
            src={src}
            alt={alt}
            className="mt-3 w-full rounded-lg border border-gray-200 dark:border-gray-700"
        />
    );
}

export function HowToContent() {
    const card =
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900";
    const h2 = "mb-3 text-base font-semibold text-gray-900 dark:text-gray-100";
    const step = "flex gap-3 text-sm text-gray-700 dark:text-gray-300";
    const num =
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white";

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-semibold">How to use</h1>
                    <Link
                        href="/"
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        ← Back
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
                {/* Intro */}
                <section className={card}>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This tool speeds up offering cars: paste a VIN to auto-fill the vehicle, build the
                        &ldquo;Offered to&rdquo; note and the driver message, and manage delivery warehouses.
                        Below is how each part works.
                    </p>
                </section>

                {/* 1. Clipboard history */}
                <section className={card}>
                    <h2 className={h2}>1. Enable clipboard history (do this first)</h2>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        Clipboard history lets you copy several things (note, message, addresses) and paste any
                        of them later — instead of only the last copied item. This workflow relies on it, so
                        turn it on once.
                    </p>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>Press <b>Windows + V</b>.</p></div>
                        <div className={step}><span className={num}>2</span><p>The first time, click <b>Turn on</b> when Windows asks.</p></div>
                        <div className={step}><span className={num}>3</span><p>From now on, <b>Windows + V</b> shows everything you&rsquo;ve copied — click any item to paste it.</p></div>
                    </div>
                    <Shot src="/how-to/clipboard-history.png" alt="Windows clipboard history (Win+V)" />
                </section>

                {/* 2. Manual offer */}
                <section className={card}>
                    <h2 className={h2}>2. Creating an offer manually</h2>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>Paste the VIN. The Year, Make and Model fill in automatically from the NHTSA database.</p></div>
                        <div className={step}><span className={num}>2</span><p>Fill Lot#, From, To (or pick a warehouse for International) and Price.</p></div>
                        <div className={step}><span className={num}>3</span><p>Paste your carrier list into the Carriers box — company names and phone numbers are extracted automatically.</p></div>
                        <div className={step}><span className={num}>4</span><p>Click the ACP Note or Driver Message block to copy it. A green &ldquo;Copied ✓&rdquo; confirms it.</p></div>
                    </div>
                    <Shot src="/how-to/copy-carriers.png" alt="Selecting the carrier list in ACP" />
                </section>

                {/* 3. ACP import */}
                <section className={card}>
                    <h2 className={h2}>3. Import from ACP (Domestic)</h2>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        Instead of typing everything, you can paste a whole order row from ACP and let the tool
                        fill the fields.
                    </p>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>In ACP, select an order row (Vehicle → Origin → Destination → prices) and copy it (Ctrl+C).</p></div>
                        <Shot src="/how-to/copy-manual.png" alt="Selecting an order row in ACP" />
                        <div className={step}><span className={num}>2</span><p>In the tool, click <b>Paste from ACP</b> — a box opens on the right.</p></div>
                        <Shot src="/how-to/paste-panel.png" alt="Paste from ACP panel" />
                        <div className={step}><span className={num}>3</span><p>Paste (Ctrl+V) into that box. VIN, Lot#, Price, From and To fill in automatically.</p></div>
                        <Shot src="/how-to/filled-form.png" alt="Form filled from ACP paste" />
                        <div className={step}><span className={num}>4</span><p>Check the fields, then copy the messages as usual.</p></div>
                    </div>
                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        Note: ACP import currently works for Domestic orders. For older cars (pre-1981) the VIN
                        won&rsquo;t decode — enter Make/Model/Year manually. International import is coming later.
                    </p>
                </section>

                {/* 4. Warehouses */}
                <section className={card}>
                    <h2 className={h2}>4. Warehouses (International)</h2>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>Switch the mode toggle to <b>International</b>.</p></div>
                        <div className={step}><span className={num}>2</span><p>Pick the destination warehouse from the dropdown — its address goes into the message.</p></div>
                        <div className={step}><span className={num}>3</span><p>Click <b>Manage</b> to add a new warehouse or delete one. Warehouses are shared across the tool.</p></div>
                    </div>
                    <Shot src="/how-to/warehouse-manage.png" alt="Managing warehouses" />
                </section>

                {/* 5. Copying output */}
                <section className={card}>
                    <h2 className={h2}>5. Copying the result</h2>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        Click the ACP Note or Driver Message block to copy its full text. A green
                        &ldquo;Copied ✓&rdquo; appears when it&rsquo;s in your clipboard.
                    </p>
                    <Shot src="/how-to/copy-output.png" alt="Copying the generated message" />
                </section>
            </main>
        </div>
    );
}