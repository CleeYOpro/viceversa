/**
 * OpenFDA drug label API (public, no API key required).
 * https://open.fda.gov/apis/drug/label/
 */

const DEFAULT_LABEL_URL = 'https://api.fda.gov/drug/label.json';

export interface DrugLabelSummary {
  brandNames: string[];
  genericNames: string[];
  /** SPL drug interactions text when present */
  drugInteractions?: string;
  warnings?: string;
  source: 'openfda' | 'mock';
}

export interface OpenFDALabelResult {
  drug_interactions?: string[];
  warnings?: string[];
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
  };
}

export interface OpenFDALabelResponse {
  results?: OpenFDALabelResult[];
}

function getLabelBaseUrl(): string {
  return process.env.EXPO_PUBLIC_OPENFDA_LABEL_URL || DEFAULT_LABEL_URL;
}

function normalizeInteractions(raw?: string[]): string | undefined {
  if (!raw?.length) return undefined;
  return raw.map((s) => String(s).trim()).filter(Boolean).join('\n\n');
}

function normalizeWarnings(raw?: string[]): string | undefined {
  if (!raw?.length) return undefined;
  return raw.map((s) => String(s).trim()).filter(Boolean).join('\n\n');
}

async function fetchOne(searchFragment: string): Promise<OpenFDALabelResult | null> {
  const search = encodeURIComponent(searchFragment);
  const url = `${getLabelBaseUrl()}?search=${search}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as OpenFDALabelResponse;
  return data.results?.[0] ?? null;
}

function rowToSummary(row: OpenFDALabelResult): DrugLabelSummary {
  return {
    brandNames: row.openfda?.brand_name ?? [],
    genericNames: row.openfda?.generic_name ?? [],
    drugInteractions: normalizeInteractions(row.drug_interactions),
    warnings: normalizeWarnings(row.warnings),
    source: 'openfda',
  };
}

/**
 * Search SPL labels by brand or generic name (first match).
 */
export async function fetchDrugLabelByName(drugName: string): Promise<DrugLabelSummary | null> {
  const term = drugName.trim();
  if (!term) return null;

  const escaped = term.replace(/"/g, '\\"');
  const brandFirst = await fetchOne(`openfda.brand_name:"${escaped}"`);
  if (brandFirst) return rowToSummary(brandFirst);

  const genericRow = await fetchOne(`openfda.generic_name:"${escaped}"`);
  if (genericRow) return rowToSummary(genericRow);

  return null;
}
