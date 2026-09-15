import { NextRequest, NextResponse } from 'next/server';
import type { AIAnalysisResult } from '@/types/drug';

// ── Gemini models to try in order (free-tier compatible) ──────────────────────
const MODELS_TO_TRY = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
];

// ── Per-reagent forensic context for the prompt ───────────────────────────────
const REAGENT_CRITERIA: Record<string, { targetDrug: string; expectedColor: string; notes: string }> = {
  marquis:          { targetDrug: 'Opiates / Heroin / MDMA / Methamphetamine', expectedColor: 'Deep purple-to-black for opiates; orange-brown for meth', notes: 'No colour change = Negative.' },
  scott:            { targetDrug: 'Cocaine / Crack', expectedColor: 'Cobalt blue precipitate in lower layer', notes: 'Must see distinct cobalt-blue flakes.' },
  duquenois_levine: { targetDrug: 'Cannabis / Hashish / THC', expectedColor: 'Deep violet/indigo in bottom chloroform layer', notes: 'Top layer must remain clear-pinkish.' },
  ehrlich:          { targetDrug: 'LSD / Indole Alkaloids', expectedColor: 'Gradual purple/indigo within 2–3 minutes', notes: 'Slow colour development required.' },
  mandelin:         { targetDrug: 'Ketamine / Amphetamines', expectedColor: 'Deep olive-green for ketamine; black for amphetamines', notes: 'Check for dark-green hue.' },
  mecke:            { targetDrug: 'Heroin / MDMA', expectedColor: 'Blue-green for heroin; blue-black for MDMA', notes: 'Rapid dark colour transition.' },
  froehde:          { targetDrug: 'Heroin / Psychedelics', expectedColor: 'Purple for heroin; blue-green for psychedelics', notes: 'Watch for distinctive purple.' },
  dille_koppanyi:   { targetDrug: 'Barbiturates', expectedColor: 'Red-violet colour reaction', notes: 'Distinct red-violet hue required.' },
  nitric_acid:      { targetDrug: 'Heroin / Cocaine', expectedColor: 'Yellow-orange for heroin; orange-red for cocaine', notes: 'Acidic reaction.' },
};

export function buildGeminiPrompt(reagentType: string): string {
  const criteria = REAGENT_CRITERIA[reagentType.toLowerCase()] || REAGENT_CRITERIA.marquis;

  return `
You are a forensic image validator for DRUG-SEAL AI — a field narcotics identification system used by India's Narcotics Control Bureau.

REAGENT BEING TESTED: ${reagentType.toUpperCase()}
TARGET SUBSTANCE: ${criteria.targetDrug}
EXPECTED POSITIVE COLOUR: ${criteria.expectedColor}
NOTES: ${criteria.notes}

═══ STEP 1 — IMAGE VALIDATION (check FIRST) ═══
REJECT the image immediately if ANY of these are true:
  • The image is blurry or out-of-focus (reagent chamber unreadable)
  • Severe specular glare obscures the fluid colour
  • No drug test pouch / kit is visible in the image
  • The reagent fluid chamber is hidden, empty, or not reacted yet
  • The image is of an unrelated object (road, person, etc.)

═══ STEP 2 — IF ACCEPTED, OBSERVE ONLY ═══
Report strictly what you can SEE in the image:
  • Describe the fluid colour qualitatively (e.g. "deep violet-purple")
  • State whether the colour matches the expected positive reaction
  • Read kit label, lot number, and expiry date ONLY if the text is clearly legible
  • Note any visible seal damage or tamper evidence on the packaging
  
DO NOT invent, guess, or extrapolate:
  ✗ No purity percentages
  ✗ No adulterant lists
  ✗ No chemical concentration claims
  ✗ No lab-instrument data

═══ OUTPUT — Strict JSON only ═══
Return ONLY a valid JSON object conforming to this exact structure:
{
  "verdict": "ACCEPTED" or "REJECTED",
  "rejectReason": "string or null — reason if REJECTED, e.g. Blurry image / No test kit visible",
  "kitType": "string or null — kit brand/type if legible on label",
  "observedColor": "string — qualitative colour description of the fluid",
  "substanceClass": "string — qualitative match e.g. Opiates/Alkaloids, Cocaine derivative, or Negative",
  "tamperDetected": true or false,
  "pouchLotNumber": "string or null",
  "pouchExpiry": "string or null",
  "courtSummary": "One formal sentence for NDPS Act Sec. 52 panchnama, describing the observable reaction only. If REJECTED write: Image rejected — officer directed to retake."
}
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, reagentType } = body;

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No image data received.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local',
      }, { status: 500 });
    }

    const promptText = buildGeminiPrompt(reagentType || 'marquis');
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // Try each model in order until one succeeds
    let lastError = '';
    for (const model of MODELS_TO_TRY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,   // Low temperature for deterministic forensic output
                maxOutputTokens: 400,
              },
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          lastError = `${model}: HTTP ${response.status} — ${errText.slice(0, 200)}`;
          console.warn(`[drug-review] ${lastError}`);
          continue; // try next model
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          lastError = `${model}: Empty response from Gemini`;
          continue;
        }

        // Parse Gemini JSON
        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          // Sometimes Gemini wraps in ```json ... ``` even with responseMimeType set
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            lastError = `${model}: Could not parse JSON from response`;
            continue;
          }
          parsed = JSON.parse(jsonMatch[0]);
        }

        // Map to AIAnalysisResult
        const analysis: AIAnalysisResult = {
          verdict:       parsed.verdict ?? 'ACCEPTED',
          rejectReason:  parsed.rejectReason ?? null,
          kitType:       parsed.kitType ?? null,
          observedColor: parsed.observedColor ?? 'Not observed',
          substanceClass: parsed.substanceClass ?? null,
          tamperDetected: parsed.tamperDetected ?? false,
          pouchLotNumber: parsed.pouchLotNumber ?? null,
          pouchExpiry:   parsed.pouchExpiry ?? null,
          courtSummary:  parsed.courtSummary ?? '',
          // Legacy fields filled from qualitative data only
          substance:     parsed.substanceClass ?? 'Field observation — see court summary',
          confidence:    parsed.verdict === 'ACCEPTED' ? 0.9 : 0.0,
        };

        return NextResponse.json({ success: true, analysis, source: model });

      } catch (err: any) {
        lastError = `${model}: ${err?.message ?? 'Unknown error'}`;
        console.warn(`[drug-review] Gemini attempt failed:`, lastError);
      }
    }

    // All models failed — no silent fallback, return an honest error
    return NextResponse.json({
      success: false,
      error: `Gemini unavailable. Last error: ${lastError}. Ensure GEMINI_API_KEY is valid and try again.`,
    }, { status: 503 });

  } catch (error: any) {
    console.error('[drug-review] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
