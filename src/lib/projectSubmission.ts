import { z } from 'zod';
import { isHttpsUrl } from './httpsUrl.ts';

/** Limits enforced by the `project_submissions` table checks. */
export const PROJECT_URL_MAX = 500;
export const PROJECT_NOTES_MAX = 2000;

export const projectSubmissionSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Cole o link do resultado do seu projeto.')
    .max(PROJECT_URL_MAX, `O link pode ter no máximo ${PROJECT_URL_MAX} caracteres.`)
    .refine(isHttpsUrl, 'Use um link completo que comece com https:// (documento, pasta, post ou app publicado).'),
  notes: z
    .string()
    .trim()
    .max(PROJECT_NOTES_MAX, `As observações podem ter no máximo ${PROJECT_NOTES_MAX} caracteres.`)
    .transform((notes) => (notes === '' ? null : notes)),
});

export type ProjectSubmissionInput = z.input<typeof projectSubmissionSchema>;
export type ProjectSubmissionValues = z.output<typeof projectSubmissionSchema>;
