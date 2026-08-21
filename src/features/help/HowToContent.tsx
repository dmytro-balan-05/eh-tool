function Video({ src }: { src: string }) {
    return (
        <video
            src={src}
            controls
            preload="metadata"
            className="mt-3 w-full rounded-lg border border-gray-200 dark:border-gray-700"
        />
    );
}

function Sample({ children }: { children: React.ReactNode }) {
    return (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
      {children}
    </pre>
    );
}

export function HowToContent() {
    const card =
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900";
    const h2 = "mb-1 text-base font-semibold text-gray-900 dark:text-gray-100";
    const why =
        "mb-3 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-800 dark:bg-teal-950/40 dark:text-teal-300";
    const step = "flex gap-3 text-sm text-gray-700 dark:text-gray-300";
    const num =
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white";

    return (
        <div className="bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
                <h1 className="text-lg font-semibold">How to use</h1>

                <section className={card}>
                    <h2 className={h2}>Your day with EH Tool</h2>
                    <div className="mt-3 space-y-3">
                        <div className={step}><span className={num}>1</span><p><b>Morning</b> — open <b>Report</b>, hit <b>Assemble draft</b>. Yesterday&rsquo;s offers, request counts, late deliveries and your routines are already filled in. Add anything special, then <b>Copy to Slack</b>.</p></div>
                        <div className={step}><span className={num}>2</span><p><b>During the day</b> — <b>Offer</b> for sending cars to carriers, <b>Requests</b> for driver questions, <b>Late</b> for tracking late deliveries.</p></div>
                        <div className={step}><span className={num}>3</span><p><b>Everything records itself</b> — you never retype yesterday&rsquo;s work.</p></div>
                        <div className={step}><span className={num}>4</span><p><b>Tuesday</b> — one click on <b>Weekly report</b> gives you last week&rsquo;s summary for the meeting.</p></div>
                    </div>
                </section>

                <section className={card}>
                    <h2 className={h2}>First: turn on clipboard history</h2>
                    <p className={why}>Why: you copy several things per offer. Clipboard history lets you paste any of them, not just the last one.</p>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>Press <b>Windows + V</b> and click <b>Turn on</b> the first time.</p></div>
                        <div className={step}><span className={num}>2</span><p>From now on <b>Windows + V</b> shows everything you copied.</p></div>
                    </div>
                    <Video src="/how-to/clipboard.mp4" />
                </section>

                <section className={card}>
                    <h2 className={h2}>Offer — sending cars to carriers</h2>
                    <p className={why}>Why: builds the ACP note and driver message for you, and remembers every offer so your report writes itself.</p>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>Paste the <b>VIN</b> — Year, Make, Model fill in automatically.</p></div>
                        <div className={step}><span className={num}>2</span><p>Or click <b>Paste from ACP</b> and paste a whole order row — VIN, Lot#, price, from/to fill in at once (Domestic).</p></div>
                        <div className={step}><span className={num}>3</span><p>Paste your carrier list into the Carriers box. Names and phones are extracted automatically.</p></div>
                        <div className={step}><span className={num}>4</span><p>Click <b>Driver Message</b> to copy it — the offer is saved to your history at the same time. Use <b>Copy ph#s</b> to grab every carrier number at once for RingCentral.</p></div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">What an ACP order row looks like when pasted:</p>
                    <Sample>{`2018 Bentley Flying Spur
SCBET9ZA9JC067941
Copart 47431416  Copart Logo
Storage: $250 ( 11th day)   Awaiting Pickup   Copart FL - Miami North
(305) 688-6400 (Duanle Garcia)
 12850 Nw 27Th Ave.,
Opa Locka, FL 33054
...
$481
$700          ← this is the price the tool picks
Calc $481`}</Sample>
                    <Video src="/how-to/offer.mp4" />
                </section>

                <section className={card}>
                    <h2 className={h2}>Requests — driver questions</h2>
                    <p className={why}>Why: no more scrolling Teams to remember who you still owe an answer. Everything is a card with a status, and the counts land in your report.</p>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>Copy from Teams, paste into <b>International Team</b> or <b>Customer Service</b>. Cards appear instantly, tagged by source.</p></div>
                        <div className={step}><span className={num}>2</span><p>Tags (ETA, Title, Damage…) are suggested automatically. Tap to adjust. Teams junk like &ldquo;1 Like reaction&rdquo; is stripped out.</p></div>
                        <div className={step}><span className={num}>3</span><p>Click the VIN chip to open that order in ACP.</p></div>
                        <div className={step}><span className={num}>4</span><p><b>No answer</b> if the driver didn&rsquo;t pick up, <b>Resolve</b> when done. Resolved cards move to <b>Archive</b>; open ones stay for tomorrow.</p></div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">Paste requests like this — one per line:</p>
                    <Sample>{`WB10P2305S6L48019 Could you please check if the car will be delivered today?
1 Like reaction.
2T3W1RFV0PC240302 + 1FMCU0GD1HUE92807 could you check on titles here as well`}</Sample>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        The junk line is dropped, and the two VINs joined by + become two separate cards.
                    </p>
                    <Video src="/how-to/requests.mp4" />
                </section>

                <section className={card}>
                    <h2 className={h2}>Late — tracking late deliveries</h2>
                    <p className={why}>Why: gives you an exact number for the daily and weekly report instead of counting by hand.</p>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>Copy the late deliveries page from ACP and paste it into the box. VINs are extracted automatically.</p></div>
                        <div className={step}><span className={num}>2</span><p>Already-counted VINs are ignored, and orders on excluded carriers (ADP Towing, Copart Delivery, Marine Transport Logistics) are skipped.</p></div>
                        <div className={step}><span className={num}>3</span><p>The counter resets every Monday. Re-paste a car that&rsquo;s still late on the new week and it counts again.</p></div>
                    </div>
                    <Video src="/how-to/late.mp4" />
                </section>

                <section className={card}>
                    <h2 className={h2}>Report — daily standup</h2>
                    <p className={why}>Why: the boring half (what you offered, how many requests, late deliveries) is filled in for you. You only add what matters — the blockers.</p>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p><b>Assemble draft</b> pulls yesterday&rsquo;s offers, request counts (Int / CS with solved), late deliveries, and your routines. Your own blocks are kept.</p></div>
                        <div className={step}><span className={num}>2</span><p>Click a block to edit, <b>+ Add block</b> for anything new, drag <b>⠿</b> to reorder or move between sections.</p></div>
                        <div className={step}><span className={num}>3</span><p><b>Copy to Slack</b> for the daily. <b>Weekly report</b> builds last week&rsquo;s summary for the Tuesday meeting.</p></div>
                    </div>
                    <Video src="/how-to/report.mp4" />
                </section>

                <section className={card}>
                    <h2 className={h2}>Routines — recurring items</h2>
                    <p className={why}>Why: things you do every single day shouldn&rsquo;t be typed every single day.</p>
                    <div className="space-y-3">
                        <div className={step}><span className={num}>1</span><p>Add a recurring item and pick its sections — Done, Plan, or both.</p></div>
                        <div className={step}><span className={num}>2</span><p><b>Assemble draft</b> adds active routines automatically.</p></div>
                        <div className={step}><span className={num}>3</span><p>Use the toggle to pause one without deleting it.</p></div>
                    </div>
                    <Video src="/how-to/routines.mp4" />
                </section>

                <section className={card}>
                    <h2 className={h2}>FAQ</h2>
                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">The VIN won&rsquo;t decode</p>
                            <p className="text-gray-600 dark:text-gray-400">Cars built before 1981 have short VINs that aren&rsquo;t in the NHTSA database. Type Make/Model/Year manually.</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">My offer didn&rsquo;t show up in My Offers</p>
                            <p className="text-gray-600 dark:text-gray-400">An offer is saved only when every field is filled (VIN, vehicle, from, to, price) and the ACP note isn&rsquo;t empty. The same VIN is saved once per day.</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Where did my resolved request go?</p>
                            <p className="text-gray-600 dark:text-gray-400">To the <b>Archive</b> tab. It still counts toward your report — the board just stays clean.</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">ACP import filled the wrong price</p>
                            <p className="text-gray-600 dark:text-gray-400">The tool takes the amount directly above the &ldquo;Calc&rdquo; line — that&rsquo;s the price you offer drivers. Storage and due amounts are ignored.</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Assemble draft deleted my text</p>
                            <p className="text-gray-600 dark:text-gray-400">It only refreshes auto and routine blocks. Anything you typed yourself stays.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}