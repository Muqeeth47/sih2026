// src/utils/reagentMatrix.ts
// UNODC Reference Reagent Color Matrix
// Sources: UNODC Drug Testing Guidelines ST/NAR/13, WHO TRS 1007
// Marquis, Scott, Duquenois-Levine, Mecke, Mandelin reagent reference data

import { rgbToLab } from './colorMath';
import type { ReagentReference, ReagentType, SubstanceClass } from '@/types/drug';

function makeRef(
  reagentType: ReagentType,
  substanceClass: SubstanceClass,
  colorName: string,
  hex: string,
  threshold: number,
  desc: string,
  unodc: string
): ReagentReference {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const [L, a, bStar] = rgbToLab(r, g, b);
  return {
    reagentType,
    substanceClass,
    expectedColorName: colorName,
    expectedHex: hex,
    labL: L, labA: a, labB: bStar,
    deltaEThreshold: threshold,
    description: desc,
    unodc_reference: unodc,
  };
}

export interface ReagentStandard {
  reagentId: string;
  substanceName: string;
  targetLab: { L: number; a: number; b: number };
  maxDeltaEThreshold: number;
}

export const REAGENT_STANDARDS: Record<string, ReagentStandard[]> = {
  marquis: [
    {
      reagentId: 'marquis_opiate',
      substanceName: 'Opiate / Heroin Alkaloid',
      targetLab: { L: 24.5, a: 42.1, b: -36.8 }, // Deep Violet / Purple
      maxDeltaEThreshold: 18.0,
    },
    {
      reagentId: 'marquis_mdma',
      substanceName: 'MDMA / Ecstasy',
      targetLab: { L: 28.2, a: 48.0, b: -28.5 }, // Deep Purple to Black
      maxDeltaEThreshold: 16.0,
    },
    {
      reagentId: 'marquis_meth',
      substanceName: 'Methamphetamine',
      targetLab: { L: 46.2, a: 38.5, b: 51.4 }, // Dark Orange / Brown
      maxDeltaEThreshold: 16.0,
    },
    {
      reagentId: 'marquis_fentanyl',
      substanceName: 'Fentanyl Synthetic Opioid',
      targetLab: { L: 52.0, a: 34.0, b: 42.0 }, // Orange to Light Brown
      maxDeltaEThreshold: 17.0,
    },
    {
      reagentId: 'marquis_methaqualone',
      substanceName: 'Methaqualone (Mandrax)',
      targetLab: { L: 58.0, a: 18.0, b: 45.0 }, // Yellow-Brown
      maxDeltaEThreshold: 18.0,
    },
  ],
  scott: [
    {
      reagentId: 'scott_cocaine',
      substanceName: 'Cocaine Hydrochloride / Crack',
      targetLab: { L: 31.8, a: -14.2, b: -54.6 }, // Cobalt Blue
      maxDeltaEThreshold: 17.5,
    },
  ],
  duquenois_levine: [
    {
      reagentId: 'duquenois_cannabis',
      substanceName: 'Cannabis / THC (Ganja / Hashish)',
      targetLab: { L: 28.0, a: 32.4, b: -44.2 }, // Indigo Violet Layer
      maxDeltaEThreshold: 18.0,
    },
  ],
  ehrlich: [
    {
      reagentId: 'ehrlich_lsd',
      substanceName: 'LSD / Indole Alkaloids',
      targetLab: { L: 30.2, a: 38.4, b: -38.6 }, // Violet / Indigo
      maxDeltaEThreshold: 18.0,
    },
    {
      reagentId: 'ehrlich_psilocybin',
      substanceName: 'Psilocybin / Magic Mushrooms',
      targetLab: { L: 26.5, a: 40.2, b: -32.1 }, // Purple Transition
      maxDeltaEThreshold: 17.5,
    },
  ],
  mandelin: [
    {
      reagentId: 'mandelin_ketamine',
      substanceName: 'Ketamine Hydrochloride',
      targetLab: { L: 44.0, a: -22.5, b: 28.0 }, // Deep Olive Green
      maxDeltaEThreshold: 16.5,
    },
    {
      reagentId: 'mandelin_amphetamines',
      substanceName: 'Amphetamine Sulfate',
      targetLab: { L: 18.0, a: 2.0, b: 4.0 }, // Dark Green to Black
      maxDeltaEThreshold: 15.0,
    },
  ],
  mecke: [
    {
      reagentId: 'mecke_heroin',
      substanceName: 'Heroin / Morphine',
      targetLab: { L: 42.0, a: -26.0, b: 8.0 }, // Blue-Green
      maxDeltaEThreshold: 16.0,
    },
    {
      reagentId: 'mecke_mdma',
      substanceName: 'MDMA / MDA',
      targetLab: { L: 16.0, a: 4.0, b: -12.0 }, // Deep Blue-Black
      maxDeltaEThreshold: 15.0,
    },
  ],
  froehde: [
    {
      reagentId: 'froehde_heroin',
      substanceName: 'Heroin Diacetylmorphine',
      targetLab: { L: 35.0, a: 36.0, b: -28.0 }, // Purple
      maxDeltaEThreshold: 16.0,
    },
  ],
  dille_koppanyi: [
    {
      reagentId: 'dille_barbiturates',
      substanceName: 'Barbiturates (Phenobarbital/Secobarbital)',
      targetLab: { L: 38.0, a: 52.0, b: 12.0 }, // Red-Violet
      maxDeltaEThreshold: 17.0,
    },
  ],
  nitric_acid: [
    {
      reagentId: 'nitric_heroin',
      substanceName: 'Heroin Alkaloid',
      targetLab: { L: 58.0, a: 24.0, b: 58.0 }, // Yellow to Orange
      maxDeltaEThreshold: 16.0,
    },
    {
      reagentId: 'nitric_cocaine',
      substanceName: 'Cocaine Salt',
      targetLab: { L: 42.0, a: 48.0, b: 38.0 }, // Orange-Red
      maxDeltaEThreshold: 16.0,
    },
  ],
};

export const REAGENT_MATRIX: ReagentReference[] = [
  // ── MARQUIS REAGENT ─────────────────────────────────────────
  makeRef('marquis', 'heroin',             'Purple → Black',    '#2d1b69', 14, 'Purple turning black — indicative of heroin/opiates',   'UNODC-ST/NAR/13 §4.2.1'),
  makeRef('marquis', 'mdma_amphetamines',  'Purple/Violet',     '#7b2d8b', 15, 'Purple/violet — MDMA, MDA, amphetamines',              'UNODC-ST/NAR/13 §4.2.2'),
  makeRef('marquis', 'methamphetamine',    'Orange → Brown',    '#c2621a', 15, 'Orange turning brown — methamphetamine',               'UNODC-ST/NAR/13 §4.2.3'),
  makeRef('marquis', 'fentanyl',           'Orange-Brown',      '#d97706', 15, 'Orange to light brown — fentanyl synthetic opioid',    'UNODC-ST/NAR/13 §4.2.4'),
  makeRef('marquis', 'methaqualone',       'Yellow-Orange',     '#a16207', 16, 'Yellow-orange reaction — methaqualone (mandrax)',      'UNODC-ST/NAR/13 §4.2.5'),
  makeRef('marquis', 'cannabis',           'No reaction',       '#f5f0e8', 18, 'No color change — cannabis (negative for Marquis)',    'UNODC-ST/NAR/13 §4.2.6'),
  makeRef('marquis', 'negative',           'No reaction',       '#f5f0e8', 18, 'No reaction observed',                                'UNODC-ST/NAR/13 §4.1'),

  // ── SCOTT REAGENT (Cocaine/Crack) ───────────────────────────
  makeRef('scott', 'cocaine',              'Cobalt Blue',       '#1a56c4', 14, 'Cobalt blue precipitate in lower layer — cocaine HCl',  'UNODC-ST/NAR/13 §4.3.1'),
  makeRef('scott', 'negative',             'No reaction',       '#f5f0e8', 18, 'No blue color — negative for cocaine',                'UNODC-ST/NAR/13 §4.3'),

  // ── DUQUENOIS-LEVINE (Cannabis) ─────────────────────────────
  makeRef('duquenois_levine', 'cannabis',  'Purple in CHCl₃',  '#6b21a8', 14, 'Purple color in bottom chloroform layer — cannabis/THC','UNODC-ST/NAR/13 §4.4.1'),
  makeRef('duquenois_levine', 'negative',  'No reaction',       '#f5f0e8', 18, 'No purple — negative for cannabis',                   'UNODC-ST/NAR/13 §4.4'),

  // ── EHRLICH REAGENT (LSD/Indoles) ───────────────────────────
  makeRef('ehrlich', 'lsd',                'Purple / Indigo',   '#4c1d95', 15, 'Gradual purple/indigo shift within 2-3 mins — LSD/indoles', 'UNODC-ST/NAR/13 §4.9.1'),
  makeRef('ehrlich', 'psychedelics',       'Violet',            '#581c87', 15, 'Violet/purple development — psilocybin/indole compounds', 'UNODC-ST/NAR/13 §4.9.2'),
  makeRef('ehrlich', 'negative',           'No reaction',       '#f5f0e8', 18, 'No purple hue developed within 5 minutes',            'UNODC-ST/NAR/13 §4.9'),

  // ── MECKE REAGENT ───────────────────────────────────────────
  makeRef('mecke', 'heroin',               'Blue → Green',      '#1e7a6e', 14, 'Blue-green — opiates/heroin',                        'UNODC-ST/NAR/13 §4.5.1'),
  makeRef('mecke', 'mdma_amphetamines',    'Blue → Black',      '#1a2744', 14, 'Blue turning black — MDMA',                          'UNODC-ST/NAR/13 §4.5.2'),
  makeRef('mecke', 'ketamine',             'Yellow → Orange',   '#e88c2a', 15, 'Yellow-orange — ketamine',                           'UNODC-ST/NAR/13 §4.5.3'),
  makeRef('mecke', 'negative',             'No reaction',       '#f5f0e8', 18, 'No reaction',                                        'UNODC-ST/NAR/13 §4.5'),

  // ── MANDELIN REAGENT ────────────────────────────────────────
  makeRef('mandelin', 'ketamine',          'Deep Olive Green',  '#15803d', 14, 'Deep olive green — ketamine hydrochloride',          'UNODC-ST/NAR/13 §4.6.1'),
  makeRef('mandelin', 'mdma_amphetamines', 'Black',             '#1a1a1a', 14, 'Black — amphetamines/methamphetamine',               'UNODC-ST/NAR/13 §4.6.2'),
  makeRef('mandelin', 'cocaine',           'Yellow → Green',    '#7a9e2a', 15, 'Yellow-green — cocaine',                             'UNODC-ST/NAR/13 §4.6.3'),
  makeRef('mandelin', 'negative',          'No reaction',       '#f5f0e8', 18, 'No reaction',                                        'UNODC-ST/NAR/13 §4.6'),

  // ── FROEHDE REAGENT ─────────────────────────────────────────
  makeRef('froehde', 'heroin',             'Purple',            '#7c3aed', 14, 'Purple — heroin/opiates',                            'UNODC-ST/NAR/13 §4.7.1'),
  makeRef('froehde', 'psychedelics',       'Blue → Green',      '#0d7e5a', 15, 'Blue-green — psilocybin/psychedelics',               'UNODC-ST/NAR/13 §4.7.2'),
  makeRef('froehde', 'negative',           'No reaction',       '#f5f0e8', 18, 'No reaction',                                        'UNODC-ST/NAR/13 §4.7'),

  // ── DILLE-KOPPANYI (Barbiturates) ───────────────────────────
  makeRef('dille_koppanyi', 'barbiturates','Red-Violet',        '#b91c1c', 14, 'Red-violet coloration — positive for Barbiturates', 'UNODC-ST/NAR/13 §4.10.1'),
  makeRef('dille_koppanyi', 'negative',    'No reaction',       '#f5f0e8', 18, 'No red-violet — negative for barbiturates',          'UNODC-ST/NAR/13 §4.10'),

  // ── NITRIC ACID ─────────────────────────────────────────────
  makeRef('nitric_acid', 'heroin',         'Yellow → Orange',   '#d4870a', 14, 'Yellow-orange — heroin',                            'UNODC-ST/NAR/13 §4.8.1'),
  makeRef('nitric_acid', 'cocaine',        'Orange → Red',      '#c9330f', 14, 'Orange-red — cocaine',                              'UNODC-ST/NAR/13 §4.8.2'),
  makeRef('nitric_acid', 'negative',       'No reaction',       '#f5f0e8', 18, 'No reaction',                                       'UNODC-ST/NAR/13 §4.8'),
];

/** Find all reference entries for a given reagent type */
export function getReagentRefs(reagentType: ReagentType): ReagentReference[] {
  return REAGENT_MATRIX.filter(r => r.reagentType === reagentType);
}

/** Human-readable reagent display names */
export const REAGENT_DISPLAY_NAMES: Record<ReagentType, string> = {
  marquis:           'Marquis (Opiates/Meth/Fentanyl)',
  scott:             'Scott (Cocaine/Crack)',
  duquenois_levine:  'Duquenois-Levine (Cannabis/THC)',
  ehrlich:           'Ehrlich (LSD/Indoles)',
  mandelin:          'Mandelin (Ketamine/Amph)',
  mecke:             'Mecke (Heroin/MDMA)',
  froehde:           'Froehde (Opiates/Psychedelics)',
  dille_koppanyi:    'Dille-Koppanyi (Barbiturates)',
  nitric_acid:       'Nitric Acid (Heroin/Cocaine)',
};

/** Human-readable substance display names */
export const SUBSTANCE_DISPLAY_NAMES: Record<SubstanceClass, string> = {
  cannabis:               'Cannabis / THC (Ganja/Charas)',
  cocaine:                'Cocaine Hydrochloride / Crack',
  heroin:                 'Heroin (Diacetylmorphine)',
  mdma_amphetamines:      'MDMA / Ecstasy / Amphetamines',
  methamphetamine:        'Methamphetamine (Ice/Crystal)',
  fentanyl:               'Fentanyl Synthetic Opioid',
  opiates:                'Opiates / Morphine / Codeine',
  benzodiazepines:        'Benzodiazepines (Alprazolam/Diazepam)',
  barbiturates:           'Barbiturates (Phenobarbital)',
  ketamine:               'Ketamine Hydrochloride',
  lsd:                    'LSD (Lysergic Acid Diethylamide)',
  methaqualone:           'Methaqualone (Mandrax)',
  synthetic_cannabinoids: 'Synthetic Cannabinoids (Spice/K2)',
  psychedelics:           'Psychedelics / Psilocybin',
  unknown:                'Unknown Suspected Compound',
  negative:               'Negative / Inconclusive Reaction',
};
