'use server';

import { z } from 'zod';

import { processMultipleInstructions } from '@/lib/medilingo-automata';

export interface FormState {
  status: 'idle' | 'success' | 'error';
  data?: string;
  message?: string;
  input?: string;
}

const schema = z.object({
  dosage: z.string().min(3, { message: 'Please enter a dosage instruction.' }).max(500, { message: 'Instruction is too long.' }),
});

export async function simplifyPrescription(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    dosage: formData.get('dosage'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.errors[0].message,
      input: formData.get('dosage') as string,
    };
  }
  
  const input = validatedFields.data.dosage;

  try {
   
    const resultsArray = processMultipleInstructions(input);
    
    const resultString = resultsArray.join('\n');

    return { 
      status: 'success', 
      data: resultString, 
      input 
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred.',
      input,
    };
  }
}