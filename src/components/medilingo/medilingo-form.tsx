"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Info, Send, Bot, XCircle } from "lucide-react";
import { simplifyPrescription, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "../ui/label";

const initialState: FormState = {
  status: 'idle'
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Processing...' : 'Simplify'}
      <Send className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function MediLingoForm() {
  const [state, formAction] = useActionState(simplifyPrescription, initialState);
  const { pending } = useFormStatus();
  const [progress, setProgress] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (pending) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress(oldProgress => {
          if (oldProgress >= 95) {
            return oldProgress;
          }
          return Math.min(oldProgress + 10, 95);
        });
      }, 200);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  }, [pending]);
  
  useEffect(() => {
    if (state.status !== 'idle') {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    if (state.status === 'success') {
      // Don't clear form on success, let user see their input
    }
  }, [state]);


  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <Progress value={progress} className={`h-1 w-full transition-opacity duration-300 ${progress > 0 ? 'opacity-100' : 'opacity-0'}`} />
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Enter Dosage Instruction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dosage" className="sr-only">Dosage Instruction</Label>
            <Textarea
              id="dosage"
              name="dosage"
              placeholder="e.g., Take 1 tablet every 8 hours."
              rows={3}
              required
              className="resize-none"
              defaultValue={state.input}
            />
          </div>
          <div className="flex items-center justify-start rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <Info className="mr-3 h-5 w-5 flex-shrink-0" />
            <div>
              <strong>Examples:</strong>
              <ul className="list-disc pl-5">
                <li>take 2 capsules daily</li>
                <li>apply patch once a day</li>
                <li>use 1 spray every 4 hours prn</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 sm:flex-row sm:justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
      
      {(state.status === 'success' || state.status === 'error') && (
        <div className="bg-muted/50 p-6">
          {state.status === 'success' && state.data && (
            <Alert className="border-accent bg-accent/10 text-accent-foreground">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <AlertTitle className="font-bold text-accent-foreground">Simplification Successful</AlertTitle>
              <AlertDescription className="mt-2 space-y-2 text-base">
                 <p className="font-medium">"{state.input}" translates to:</p>
                 <div className="flex items-start gap-3 rounded-md bg-background p-4">
                    <Bot className="h-6 w-6 flex-shrink-0 text-primary" />
                    <p className="text-lg font-semibold text-foreground">{state.data}</p>
                 </div>
              </AlertDescription>
            </Alert>
          )}

          {state.status === 'error' && state.message && (
             <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Card>
  );
}
