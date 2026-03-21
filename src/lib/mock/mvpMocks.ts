/**
 * MVP mock data for features we are not wiring to real APIs yet:
 * nearby helpers / maps, Care.com-style matching, Stripe, hospital FHIR.
 */

import type { DrugLabelSummary } from '../openfda';

export interface MockNearbyHelper {
  id: string;
  name: string;
  distanceMiles: number;
  skills: string[];
  lat: number;
  lng: number;
}

export const MOCK_NEARBY_HELPERS: MockNearbyHelper[] = [
  {
    id: 'h1',
    name: 'Jordan Lee',
    distanceMiles: 1.2,
    skills: ['companionship', 'meal prep'],
    lat: 37.77,
    lng: -122.42,
  },
  {
    id: 'h2',
    name: 'Sam Rivera',
    distanceMiles: 2.8,
    skills: ['transport', 'errands'],
    lat: 37.76,
    lng: -122.44,
  },
];

export interface MockCareMatch {
  id: string;
  caregiverName: string;
  rating: number;
  availability: string;
}

export const MOCK_CARE_MATCHES: MockCareMatch[] = [
  {
    id: 'c1',
    caregiverName: 'Alex Morgan',
    rating: 4.9,
    availability: 'Weekday afternoons',
  },
  {
    id: 'c2',
    caregiverName: 'Priya Shah',
    rating: 4.7,
    availability: 'Weekends',
  },
];

export interface MockStripePlan {
  id: string;
  name: string;
  priceUsd: number;
  /** Not a real Stripe price id — placeholder only */
  stripePriceIdPlaceholder: string;
}

export const MOCK_STRIPE_PLANS: MockStripePlan[] = [
  {
    id: 'basic',
    name: 'Village Basic',
    priceUsd: 0,
    stripePriceIdPlaceholder: 'price_mock_basic',
  },
  {
    id: 'plus',
    name: 'Village Plus',
    priceUsd: 9.99,
    stripePriceIdPlaceholder: 'price_mock_plus',
  },
];

export interface MockFhirDischarge {
  patientId: string;
  dischargeDate: string;
  followUpInstructions: string;
  medicationsOnDischarge: { name: string; sig: string }[];
}

export const MOCK_FHIR_DISCHARGE: MockFhirDischarge = {
  patientId: 'demo-patient-001',
  dischargeDate: '2025-03-15',
  followUpInstructions: 'Follow up with PCP within 7 days. Watch for fever or shortness of breath.',
  medicationsOnDischarge: [
    { name: 'Lisinopril', sig: '10 mg by mouth once daily' },
    { name: 'Metformin', sig: '500 mg by mouth twice daily with meals' },
  ],
};

/** Fallback when OpenFDA is unreachable or returns no rows */
export function getMockDrugLabel(drugName: string): DrugLabelSummary {
  return {
    brandNames: [drugName],
    genericNames: [],
    drugInteractions:
      'This is mock interaction text for demo only. Always ask a pharmacist or clinician about drug interactions.',
    warnings: 'Mock warning: not sourced from FDA. Use OpenFDA lookup when online.',
    source: 'mock',
  };
}
