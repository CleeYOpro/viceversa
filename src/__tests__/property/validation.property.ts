import fc from 'fast-check';
import { authSchema, healthLogSchema, medicationSchema, taskSchema, helpRequestSchema } from '../../lib/utils';

// Feature: caresync-village, Property 1: Zod Schema Validation Rejects Invalid Inputs
describe('Property 1: Zod Schema Validation Rejects Invalid Inputs', () => {
  test('authSchema rejects invalid emails and passwords < 8 chars', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string({ maxLength: 7 }),
        (email, password) => {
          const result = authSchema.safeParse({ email, password });
          return result.success === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('authSchema accepts valid inputs', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        (email, password) => {
          const result = authSchema.safeParse({ email, password });
          return result.success === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('healthLogSchema rejects invalid types', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !['medication', 'mood', 'symptom', 'appointment', 'note', 'meal'].includes(s)),
        (invalidType) => {
          const result = healthLogSchema.safeParse({ type: invalidType, notes: 'test' });
          return result.success === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('medicationSchema rejects missing required fields and invalid enum', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s === ''),
        fc.string().filter(s => s === ''),
        fc.string().filter(s => !['daily', 'twice_daily', 'weekly', 'as_needed', 'custom'].includes(s)),
        (name, dosage, frequency) => {
          const result = medicationSchema.safeParse({ name, dosage, frequency, scheduleTimes: [] });
          return result.success === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
