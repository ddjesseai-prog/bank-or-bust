# v1 build deviations from DESIGN.md

Logged per PHASE-2-BUILD.md ("where the spec is silent, make the smallest
reasonable choice and log it").

1. **~1s decision window is untimed.** T1 specifies "~1s window to PULL
   or BANK" but no turn defines what happens on expiry. Forcing an
   auto-action would invent a rule the spec doesn't state; v1 leaves the
   decision point untimed.
2. **BANK-button growth caps at +64% in practice.** Decision #6 caps
   growth at n=16 with a nominal +80%; but growth starts in the ≥26%
   band (pull 9), so 8%/pull × 8 pulls = +64% at the cap. The +80%
   figure (from Turn 7) assumed onset at pull 7. Implemented literally
   per the promoted band; the nominal cap is unreachable.
3. **Vignette reaches 16% at n=16**, same arithmetic as (2); the 20%
   nominal cap would need onset before pull 9.
4. **No telemetry beacon.** v1 is static GitHub Pages with no backend or
   edge — per decision #10's stated fallback, casual-mode play is
   **untuned by design until v2**.
5. **Cosmetics are stubbed.** Gold Bars accrue and display (decision #2)
   but no skins/sound-pack shop exists in v1. Day-streak counter tracks
   and displays; 3/7/30 unlock tiers are counters only, no cosmetic art.
6. **Audio is synthesized** (WebAudio oscillators), no audio assets;
   haptics via the Vibration API where available. Both no-op silently
   where unsupported, per PHASE-2-BUILD.md.
