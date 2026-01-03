# **App Name**: MediLingo Automata

## Core Features:

- Dosage Input and Preprocessing: Accepts user-typed English dosage instructions and performs initial cleanup (trimming, lowercasing).
- Regex Tokenizer: Tokenizes the preprocessed input using regular expressions to identify key components such as ROUTE, QUANTITY, UNIT, and FREQUENCY.
- DFA Validation Engine: Validates the token sequence against a predefined DFA. Returns error messages for invalid sequences, guiding the user to rephrase their dosage instruction. Error messages are shown using UI.
- FST Simplification: Performs rule-based substitution of English medical terms into simplified Taglish equivalents using a fixed dictionary and FST.
- Taglish Output Display: Presents the simplified Taglish instruction in a readable format.

## Style Guidelines:

- Primary color: Sky blue (#87CEEB) to evoke a sense of calm and clarity.
- Background color: Very light cyan (#E0FFFF), providing a clean and unobtrusive backdrop.
- Accent color: Light green (#90EE90), for success messages after DFA validation.
- Body and headline font: 'PT Sans' for readability and a modern feel.
- Use clear, minimalist icons for input fields and output display, such as a medical capsule or a checkmark.
- A clean, single-column layout for input, processing, and output. The input area should be clearly delineated from the display area.
- A subtle animation effect, like a progress bar, during the processing of the input, providing feedback to the user.