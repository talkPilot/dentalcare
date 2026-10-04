import { z } from "zod";
export const treatmentLabels = {
  veneers: "ציפויי שיניים",
  crowns: "כתרים ושיקום",
  implants: "השתלות שיניים",
  whitening: "הלבנת שיניים",
  alignment: "יישור שיניים",
  consultation: "ייעוץ והכוונה",
};
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .refine((s) => !/[\r\n<>]/.test(s)),
  phone: z
    .string()
    .max(24)
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .refine((v) => /^(?:0[2-9]\d{7,8}|\+972[2-9]\d{7,8})$/.test(v)),
  treatment: z.enum(Object.keys(treatmentLabels)),
  region: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().max(1000).optional().default(""),
  consent: z.literal("true"),
  requestId: z.uuid(),
  token: z.string().max(4096).optional().default(""),
  website: z.string().max(100).optional().default(""),
});
export class PublicError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
export function parseLead(body) {
  const result = leadSchema.safeParse(body);
  if (!result.success)
    throw new PublicError("בדקו שהשם, מספר הטלפון וההסכמה מולאו כראוי.");
  if (result.data.website) throw new PublicError("לא ניתן לשלוח את הפנייה.");
  return result.data;
}
