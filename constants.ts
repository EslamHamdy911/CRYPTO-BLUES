import { Note } from './types';

// C Blues Scale: C, Eb, F, F#, G, Bb
// We will map the keyboard rows to octaves of this scale to ensure
// random typing sounds good with the backing track.

const BLUES_SCALE_RATIOS = [1, 1.189, 1.335, 1.414, 1.498, 1.782]; // Approximate equal temp ratios for Blues
const BASE_FREQ = 130.81; // C3 (Low)

// Helper to generate frequency based on scale index
const getFreq = (octave: number, scaleIndex: number) => {
  const base = BASE_FREQ * Math.pow(2, octave);
  return base * BLUES_SCALE_RATIOS[scaleIndex % 6];
};

// Mining Operations Jargon List
const OPS = [
  'GENESIS BLOCK', 'SHA-256 HASH', 'MERKLE ROOT', 'DIFFICULTY ADJ', 'NONCE DISCOVERY', 'POW SOLVED',
  'BLOCK REWARD', 'COINBASE TX', 'SEGWIT SIGNAL', 'LIGHTNING CHANNEL', 'SCHNORR SIG', 'TAPROOT ACT',
  'PRIVATE KEY GEN', 'PUBLIC KEY DERIV', 'ADDRESS HASH', 'MEMPOOL FLUSH', 'UTXO UPDATE', 'CONSENSUS SYNC',
  'ORPHAN BLOCK', 'STALE SHARE', 'HASHRATE BOOST', 'ASIC OPTIMIZATION', 'POOL CONNECT', 'STRATUM PROTOCOL',
  'ZERO KNOWLEDGE', 'SMART CONTRACT', 'GAS LIMIT', 'TOKEN BURN', 'DAO VOTE', 'FLASH LOAN',
  'COLD STORAGE', 'MULTISIG SIGN', 'HARD FORK', 'SOFT FORK', 'REORG CHAIN', 'DOUBLE SPEND PROTECT'
];

// Helper to create note
const createNote = (key: string, arKey: string, octave: number, scaleIdx: number, opIdx: number): Note => ({
  key,
  triggerKeys: [key, arKey],
  note: `BLUES_${octave}_${scaleIdx}`,
  frequency: getFreq(octave, scaleIdx),
  type: (scaleIdx % 2 === 0) ? 'white' : 'black', // Arbitrary visual distinction
  idx: opIdx,
  miningOp: OPS[opIdx % OPS.length]
});

// Full Keyboard Mapping
// Rows: Numbers (High), QWERTY (Mid-High), ASDF (Mid), ZXCV (Low)
export const KEYBOARD_MAP: Note[] = [
  // ROW 1 - Numbers (Highest)
  createNote('1', '1', 3, 0, 0), createNote('2', '2', 3, 1, 1), createNote('3', '3', 3, 2, 2),
  createNote('4', '4', 3, 3, 3), createNote('5', '5', 3, 4, 4), createNote('6', '6', 3, 5, 5),
  createNote('7', '7', 4, 0, 6), createNote('8', '8', 4, 1, 7), createNote('9', '9', 4, 2, 8),
  createNote('0', '0', 4, 3, 9), createNote('-', '-', 4, 4, 10), createNote('=', '=', 4, 5, 11),

  // ROW 2 - QWERTY (Mid-High)
  createNote('q', 'ض', 2, 0, 12), createNote('w', 'ص', 2, 1, 13), createNote('e', 'ث', 2, 2, 14),
  createNote('r', 'ق', 2, 3, 15), createNote('t', 'ف', 2, 4, 16), createNote('y', 'غ', 2, 5, 17),
  createNote('u', 'ع', 3, 0, 18), createNote('i', 'ه', 3, 1, 19), createNote('o', 'خ', 3, 2, 20),
  createNote('p', 'ح', 3, 3, 21), createNote('[', 'ج', 3, 4, 22), createNote(']', 'د', 3, 5, 23),

  // ROW 3 - ASDF (Mid)
  createNote('a', 'ش', 1, 0, 24), createNote('s', 'س', 1, 1, 25), createNote('d', 'ي', 1, 2, 26),
  createNote('f', 'ب', 1, 3, 27), createNote('g', 'ل', 1, 4, 28), createNote('h', 'ا', 1, 5, 29),
  createNote('j', 'ت', 2, 0, 30), createNote('k', 'ن', 2, 1, 31), createNote('l', 'م', 2, 2, 32),
  createNote(';', 'ك', 2, 3, 33), createNote("'", 'ط', 2, 4, 34),

  // ROW 4 - ZXCV (Low)
  createNote('z', 'ئ', 0, 0, 35), createNote('x', 'ء', 0, 1, 36), createNote('c', 'ؤ', 0, 2, 37),
  createNote('v', 'ر', 0, 3, 38), createNote('b', 'لا', 0, 4, 39), createNote('n', 'ى', 0, 5, 40),
  createNote('m', 'ة', 1, 0, 41), createNote(',', 'و', 1, 1, 42), createNote('.', 'ز', 1, 2, 43),
  createNote('/', 'ظ', 1, 3, 44),
];
