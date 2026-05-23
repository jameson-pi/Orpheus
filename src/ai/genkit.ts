
import {genkit} from 'genkit';

/**
 * Basic Genkit instance.
 * We are using the standard OpenAI library directly for proxy compatibility
 * to avoid plugin version mismatches and initialization errors.
 */
export const ai = genkit({
  plugins: [],
});
