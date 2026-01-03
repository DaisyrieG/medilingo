import { Pill } from 'lucide-react';
import MediLingoForm from '@/components/medilingo/medilingo-form';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3 ring-4 ring-primary/20">
            <Pill className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            MediLingo Automata
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A rule-based system to simplify English medical prescriptions into Taglish.
          </p>
        </header>

        <MediLingoForm />

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            An academic prototype for a course in Automata and Language Theory.
          </p>
          <p>
            Not for medical use. Always consult a healthcare professional.
          </p>
        </footer>
      </div>
    </main>
  );
}
