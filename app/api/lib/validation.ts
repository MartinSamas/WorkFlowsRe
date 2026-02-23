import { z } from 'zod';

export const createRequestSchema = z
  .object({
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    request_type: z.string().optional().default('vacation'),
    notes: z.string().optional(),
    approvers: z
      .array(
        z.object({
          email: z.string().email(),
          name: z.string(),
          role: z.string(),
        }),
      )
      .min(1, 'At least one approver is required'),
  })
  .refine((data) => new Date(data.start_date) < new Date(data.end_date), {
    message: 'Start date must be before end date',
    path: ['start_date'],
  })
  .refine((data) => new Date(data.start_date) > new Date(), {
    message: 'Start date must be in the future',
    path: ['start_date'],
  });

export const updateRequestSchema = z.object({
  notes: z.string().optional(),
  status: z.literal('cancelled').optional(),
});

export const approvalDecisionSchema = z.object({
  status: z.enum(['approved', 'denied']),
  decision_notes: z.string().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;
