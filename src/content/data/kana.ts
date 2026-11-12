/** Kana tables as data. Hepburn romaji. Each entry: [hiragana, katakana, romaji]. `null` = no character in that cell. */
export type KanaEntry = { h: string; k: string; r: string };
type Row = { id: string; cells: (KanaEntry | null)[] };

const e = (h: string, k: string, r: string): KanaEntry => ({ h, k, r });

export const BASIC_ROWS: Row[] = [
  { id: "a", cells: [e("あ", "ア", "a"), e("い", "イ", "i"), e("う", "ウ", "u"), e("え", "エ", "e"), e("お", "オ", "o")] },
  { id: "k", cells: [e("か", "カ", "ka"), e("き", "キ", "ki"), e("く", "ク", "ku"), e("け", "ケ", "ke"), e("こ", "コ", "ko")] },
  { id: "s", cells: [e("さ", "サ", "sa"), e("し", "シ", "shi"), e("す", "ス", "su"), e("せ", "セ", "se"), e("そ", "ソ", "so")] },
  { id: "t", cells: [e("た", "タ", "ta"), e("ち", "チ", "chi"), e("つ", "ツ", "tsu"), e("て", "テ", "te"), e("と", "ト", "to")] },
  { id: "n", cells: [e("な", "ナ", "na"), e("に", "ニ", "ni"), e("ぬ", "ヌ", "nu"), e("ね", "ネ", "ne"), e("の", "ノ", "no")] },
  { id: "h", cells: [e("は", "ハ", "ha"), e("ひ", "ヒ", "hi"), e("ふ", "フ", "fu"), e("へ", "ヘ", "he"), e("ほ", "ホ", "ho")] },
  { id: "m", cells: [e("ま", "マ", "ma"), e("み", "ミ", "mi"), e("む", "ム", "mu"), e("め", "メ", "me"), e("も", "モ", "mo")] },
  { id: "y", cells: [e("や", "ヤ", "ya"), null, e("ゆ", "ユ", "yu"), null, e("よ", "ヨ", "yo")] },
  { id: "r", cells: [e("ら", "ラ", "ra"), e("り", "リ", "ri"), e("る", "ル", "ru"), e("れ", "レ", "re"), e("ろ", "ロ", "ro")] },
  { id: "w", cells: [e("わ", "ワ", "wa"), null, e("を", "ヲ", "wo"), null, e("ん", "ン", "n")] },
];

export const VOICED_ROWS: Row[] = [
  { id: "g", cells: [e("が", "ガ", "ga"), e("ぎ", "ギ", "gi"), e("ぐ", "グ", "gu"), e("げ", "ゲ", "ge"), e("ご", "ゴ", "go")] },
  { id: "z", cells: [e("ざ", "ザ", "za"), e("じ", "ジ", "ji"), e("ず", "ズ", "zu"), e("ぜ", "ゼ", "ze"), e("ぞ", "ゾ", "zo")] },
  { id: "d", cells: [e("だ", "ダ", "da"), e("ぢ", "ヂ", "ji"), e("づ", "ヅ", "zu"), e("で", "デ", "de"), e("ど", "ド", "do")] },
  { id: "b", cells: [e("ば", "バ", "ba"), e("び", "ビ", "bi"), e("ぶ", "ブ", "bu"), e("べ", "ベ", "be"), e("ぼ", "ボ", "bo")] },
  { id: "p", cells: [e("ぱ", "パ", "pa"), e("ぴ", "ピ", "pi"), e("ぷ", "プ", "pu"), e("ぺ", "ペ", "pe"), e("ぽ", "ポ", "po")] },
];

export const rowsFor = (rows: Row[]): KanaEntry[] => rows.flatMap((r) => r.cells.filter((c): c is KanaEntry => c !== null));
export const BASIC_KANA = rowsFor(BASIC_ROWS);
export const ALL_KANA = [...BASIC_KANA, ...rowsFor(VOICED_ROWS)];
export type Script = "hiragana" | "katakana" | "both";
