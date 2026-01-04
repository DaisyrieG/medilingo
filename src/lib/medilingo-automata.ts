type TokenType = 'ROUTE' | 'QUANTITY' | 'UNIT' | 'FREQUENCY' | 'PERIOD' | 'INVALID';

export interface Token {
  type: TokenType;
  value: string;
}

const abbreviations: { [key: string]: string } = {
  'bid': 'twice a day',
  'tid': 'three times a day',
  'qid': 'four times a day',
  'q.d.': 'every day',
  'qd': 'every day',
  'q4h': 'every 4 hours',
  'q6h': 'every 6 hours',
  'q8h': 'every 8 hours',
  'prn': 'as needed',
  'ac': 'before meals',
  'pc': 'after meals',
  'hs': 'at bedtime',
  'stat': 'immediately',
  'qam': 'in the morning',
  'qpm': 'at night',
  'po': 'by mouth',
  'npo': 'nothing by mouth'
};

const tokenPatterns: { token: TokenType; pattern: RegExp }[] = [
  // Add more action words to ROUTE
  { token: 'ROUTE', pattern: /^(take|apply|consume|administer|use|insert|swallow|inhale)\b/i },
  { token: 'QUANTITY', pattern: /^(a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|\d+(\.\d+)?)\b/i },
  { token: 'UNIT', pattern: /^(tablet|capsule|pill|ml|milliliter|tablespoon|teaspoon|drop|spray|puff|application|lozenge|patch|sachet|unit|mcg|mg)s?\b/i },
  { token: 'FREQUENCY', pattern: /^(every\s\d+\s(hours?|days?|weeks?|months?)|daily|once a day|twice a day|three times a day|four times a day|as needed|before meals|after meals|at bedtime|immediately|in the morning|at night)\b/i },
  { token: 'PERIOD', pattern: /^(\.)/i }
];

const taglishDict: { [key: string]: string } = {
  'take': 'uminom', 'apply': 'ipahid', 'consume': 'kainin', 'administer': 'ibigay', 'use': 'gamitin',
  'a': 'isang', 'an': 'isang', 'one': 'isang', '1': 'isang',
  'two': 'dalawang', '2': 'dalawang', 'three': 'tatlong', '3': 'tatlong',
  'four': 'apat na', '4': 'apat na', 'five': 'limang', '5': 'limang',
  'six': 'anim na', '6': 'anim na', 'seven': 'pitong', '7': 'pitong',
  'eight': 'walong', '8': 'walong', 'nine': 'siyam na', '9': 'siyam na', 'ten': 'sampung', '10': 'sampung',
  'half': 'kalahating',
  'tablet': 'tableta', 'capsule': 'kapsula', 'pill': 'tableta', 'ml': 'ml', 'milliliter': 'milliliter',
  'tablespoon': 'kutsara', 'teaspoon': 'kutsarita', 'drop': 'patak', 'spray': 'isprey',
  'puff': 'puff', 'application': 'aplikasyon', 'lozenge': 'lozenge', 'patch': 'patch',
  'daily': 'araw-araw', 'once a day': 'isang beses sa isang araw', 'twice a day': 'dalawang beses sa isang araw',
  'three times a day': 'tatlong beses sa isang araw', 'four times a day': 'apat na beses sa isang araw',
  'as needed': 'kung kinakailangan',
  'every': 'bawat', 'hours': 'oras', 'hour': 'oras', 'days': 'na araw', 'day': 'araw',
  'weeks': 'na linggo', 'week': 'linggo', 'months': 'na buwan', 'month': 'buwan', // Timing & Meal-related (Expansion for ac, pc, etc.)
  'before meals': 'bago kumain',
  'after meals': 'pagkatapos kumain',
  'with meals': 'kasabay ng pagkain',
  'at bedtime': 'bago matulog',
  'in the morning': 'sa umaga',
  'in the afternoon': 'sa hapon',
  'at night': 'sa gabi',
  'immediately': 'ngayon na',
  'every other day': 'tuwing makalawa',
  'twice weekly': 'dalawang beses sa isang linggo',
  'for seven days': 'sa loob ng pitong araw',
  'insert': 'ipasok',
  'swallow': 'lunukin',
  'inhale': 'langhapin',
  'sachet': 'sachet',
  'unit': 'yunit',
  'mcg': 'micrograms',
  'mg': 'milligrams',
  'of': 'ng',
  'and': 'at',
  'then': 'pagkatapos'
};

function preprocess(input: string): string {
  let processed = input.trim().toLowerCase();
  for (const abbr in abbreviations) {
    processed = processed.replace(new RegExp(`\\b${abbr.replace('.', '\\.')}\\b`, 'g'), abbreviations[abbr]);
  }
  if (!processed.endsWith('.')) {
    processed += ' .';
  }
  return processed.replace(/\s+/g, ' ').trim();
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let remaining = input;

  while (remaining.length > 0) {
    let matched = false;
    for (const { token, pattern } of tokenPatterns) {
      const match = remaining.match(pattern);
      if (match) {
        const value = match[0];
        tokens.push({ type: token, value: value });
        remaining = remaining.substring(value.length).trim();
        matched = true;
        break;
      }
    }
    if (!matched) {
      const invalidToken = remaining.split(' ')[0];
      tokens.push({ type: 'INVALID', value: invalidToken });
      remaining = remaining.substring(invalidToken.length).trim();
    }
  }
  return tokens;
}

function validateDFA(tokens: Token[]): void {
  let state = 0;
  const stateMap: { [key: number]: string } = {
    0: 'start', 1: 'ROUTE', 2: 'QUANTITY', 3: 'UNIT', 4: 'FREQUENCY'
  }

  for (const token of tokens) {
    if (token.type === 'INVALID') {
      throw new Error(`Unknown term: "${token.value}". Please use simpler terms.`);
    }
    switch (state) {
      case 0: // Start state
        if (token.type === 'ROUTE') state = 1;
        else throw new Error(`Invalid instruction. Expected a route (e.g., 'take', 'apply') to start.`);
        break;
      case 1: // After ROUTE
        if (token.type === 'QUANTITY') state = 2;
        else if (token.type === 'UNIT') state = 3;
        else throw new Error(`Invalid sequence. After a route, expected quantity (e.g., '1', 'one') or unit (e.g., 'tablet'), but got ${token.type.toLowerCase()}.`);
        break;
      case 2: // After QUANTITY
        if (token.type === 'UNIT') state = 3;
        else throw new Error(`Invalid sequence. After a quantity, expected a unit (e.g., 'tablet'), but got ${token.type.toLowerCase()}.`);
        break;
      case 3: // After UNIT
        if (token.type === 'FREQUENCY') state = 4;
        else if (token.type === 'PERIOD') state = 5;
        else throw new Error(`Invalid sequence. After a unit, expected frequency (e.g., 'daily') or end of instruction, but got ${token.type.toLowerCase()}.`);
        break;
      case 4: // After FREQUENCY
        if (token.type === 'PERIOD') state = 5;
        else if (token.type === 'FREQUENCY' && token.value === 'as needed') state = 4; // Allow "as needed" after frequency
        else throw new Error(`Invalid sequence. After frequency, expected end of instruction, but got ${token.type.toLowerCase()}.`);
        break;
      default:
        throw new Error('Invalid instruction sequence.');
    }
  }

  if (state !== 5) {
    throw new Error(`Incomplete instruction. The instruction seems to be missing parts. Last valid part was a ${stateMap[state]}.`);
  }
}

function simplifyFST(tokens: Token[]): string {
    const parts: string[] = [];
    let hasQuantity = false;

    for (const token of tokens) {
        if (token.type === 'PERIOD') continue;

        if (token.type === 'QUANTITY') hasQuantity = true;

        if (token.type === 'FREQUENCY' && token.value.startsWith('every')) {
            const freqParts = token.value.split(' ');
            const translated = freqParts.map(p => taglishDict[p.toLowerCase()] || p).join(' ');
            parts.push(translated);
        } else {
            const translated = taglishDict[token.value.toLowerCase()];
            if (translated) {
                parts.push(translated);
            } else {
                parts.push(token.value);
            }
        }
    }

    // Basic grammatical reconstruction
    if (parts.length > 0) {
      if (!hasQuantity && tokens.some(t => t.type === 'UNIT')) {
        // e.g. "Take tablet daily" -> "Inumin ang tableta araw-araw"
        const unitIndex = tokens.findIndex(t => t.type === 'UNIT');
        if (unitIndex !== -1 && unitIndex > 0) {
           parts.splice(unitIndex, 0, 'ang');
        }
      } else if (hasQuantity) {
        const quantityIndex = tokens.findIndex(t => t.type === 'QUANTITY');
         if (quantityIndex !== -1 && quantityIndex > 0) {
           parts.splice(quantityIndex, 0, 'ng');
         }
      }
    }


    let result = parts.join(' ');
    result = result.charAt(0).toUpperCase() + result.slice(1) + '.';
    return result.replace(/\s+\./, '.');
}


export function processDosageInstruction(input: string): string {
  if (!input) {
    throw new Error("Input cannot be empty.");
  }
  const preprocessed = preprocess(input);
  const tokens = tokenize(preprocessed);
  validateDFA(tokens);
  return simplifyFST(tokens);
}
