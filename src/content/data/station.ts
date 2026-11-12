import type { LocalizedText } from "@/lib/localized";

/**
 * The Station's missions. Content is practice material at an APPROXIMATE N3 / N2 level (not an official JLPT list).
 * Add questions to a pool and they appear in missions automatically. ja/vi glosses are drafts until reviewed.
 */
const L = (en: string, ja: string, vi: string): LocalizedText => ({ en, ja: { text: ja, status: "draft" }, vi: { text: vi, status: "draft" } });

export interface VocabItem { word: string; reading: string; meaning: LocalizedText; level: "n3" | "n2" }
export const vocab: VocabItem[] = [
  { word: "経験", reading: "けいけん", meaning: L("experience", "経験", "kinh nghiệm"), level: "n3" },
  { word: "準備", reading: "じゅんび", meaning: L("preparation", "準備", "chuẩn bị"), level: "n3" },
  { word: "約束", reading: "やくそく", meaning: L("promise; appointment", "約束", "lời hứa; cuộc hẹn"), level: "n3" },
  { word: "習慣", reading: "しゅうかん", meaning: L("habit", "習慣", "thói quen"), level: "n3" },
  { word: "将来", reading: "しょうらい", meaning: L("future", "将来", "tương lai"), level: "n3" },
  { word: "環境", reading: "かんきょう", meaning: L("environment", "環境", "môi trường"), level: "n3" },
  { word: "理由", reading: "りゆう", meaning: L("reason", "理由", "lý do"), level: "n3" },
  { word: "事故", reading: "じこ", meaning: L("accident", "事故", "tai nạn"), level: "n3" },
  { word: "景色", reading: "けしき", meaning: L("scenery", "景色", "phong cảnh"), level: "n3" },
  { word: "相談", reading: "そうだん", meaning: L("consultation; talking it over", "相談", "bàn bạc; tư vấn"), level: "n3" },
  { word: "影響", reading: "えいきょう", meaning: L("influence; effect", "影響", "ảnh hưởng"), level: "n2" },
  { word: "維持", reading: "いじ", meaning: L("maintenance; keeping up", "維持", "duy trì"), level: "n2" },
  { word: "提案", reading: "ていあん", meaning: L("proposal", "提案", "đề xuất"), level: "n2" },
  { word: "把握", reading: "はあく", meaning: L("grasp; understanding", "把握", "nắm bắt"), level: "n2" },
  { word: "比較", reading: "ひかく", meaning: L("comparison", "比較", "so sánh"), level: "n2" },
  { word: "解決", reading: "かいけつ", meaning: L("solution; resolving", "解決", "giải quyết"), level: "n2" },
  { word: "傾向", reading: "けいこう", meaning: L("tendency; trend", "傾向", "xu hướng"), level: "n2" },
  { word: "改善", reading: "かいぜん", meaning: L("improvement", "改善", "cải thiện"), level: "n2" },
  { word: "貴重", reading: "きちょう", meaning: L("valuable; precious", "貴重", "quý giá"), level: "n2" },
  { word: "確保", reading: "かくほ", meaning: L("securing; ensuring", "確保", "đảm bảo; giành được"), level: "n2" },
];

export interface KanjiItem { word: string; reading: string; level: "n3" | "n2" }
export const kanjiReadings: KanjiItem[] = [
  { word: "経済", reading: "けいざい", level: "n3" }, { word: "技術", reading: "ぎじゅつ", level: "n3" }, { word: "都合", reading: "つごう", level: "n3" },
  { word: "笑顔", reading: "えがお", level: "n3" }, { word: "最近", reading: "さいきん", level: "n3" }, { word: "結果", reading: "けっか", level: "n3" },
  { word: "季節", reading: "きせつ", level: "n3" }, { word: "特別", reading: "とくべつ", level: "n3" },
  { word: "状況", reading: "じょうきょう", level: "n2" }, { word: "製品", reading: "せいひん", level: "n2" }, { word: "範囲", reading: "はんい", level: "n2" },
  { word: "義務", reading: "ぎむ", level: "n2" }, { word: "普及", reading: "ふきゅう", level: "n2" }, { word: "豊富", reading: "ほうふ", level: "n2" },
  { word: "厳しい", reading: "きびしい", level: "n2" }, { word: "傾向", reading: "けいこう", level: "n2" },
];

export interface GrammarItem { sentence: string; options: [string, string, string, string]; /** index of the correct option in `options` */ answer: 0; note: LocalizedText; level: "n3" | "n2" }
export const grammar: GrammarItem[] = [
  { sentence: "毎日練習した＿＿、上手になりました。", options: ["おかげで", "せいで", "くせに", "うえに"], answer: 0, level: "n3", note: L("“〜おかげで” = thanks to…, for a good result (せいで is for a bad cause).", "「おかげで」は良い結果の理由に使います（「せいで」は悪い結果）。", "“〜おかげで” = nhờ…, dùng cho kết quả tốt (せいで dùng cho kết quả xấu).") },
  { sentence: "毎朝ジョギングする＿＿にしました。", options: ["こと", "もの", "ところ", "はず"], answer: 0, level: "n3", note: L("“〜ことにする” = decide to do.", "「〜ことにする」は「〜すると決める」。", "“〜ことにする” = quyết định làm…") },
  { sentence: "日本語が話せる＿＿になりました。", options: ["ように", "ために", "ことに", "ばかりに"], answer: 0, level: "n3", note: L("“〜ようになる” = come to be able to / start to.", "「〜ようになる」は変化（できるようになる）。", "“〜ようになる” = trở nên có thể…") },
  { sentence: "彼はゲーム＿＿している。", options: ["ばかり", "ほど", "くらい", "まで"], answer: 0, level: "n3", note: L("“Nばかり” = nothing but N.", "「Nばかり」は「Nだけ」という意味。", "“Nばかり” = chỉ toàn N.") },
  { sentence: "日本に来た＿＿なので、まだ慣れていません。", options: ["ばかり", "ところ", "ほど", "まま"], answer: 0, level: "n3", note: L("“V-たばかり” = has just done V.", "「V-たばかり」は「〜したばかり」。", "“V-たばかり” = vừa mới làm V.") },
  { sentence: "音楽を聞き＿＿、勉強します。", options: ["ながら", "ように", "ために", "たら"], answer: 0, level: "n3", note: L("“V-ながら” = while doing V.", "「V-ながら」は同時進行。", "“V-ながら” = vừa làm V vừa…") },
  { sentence: "明日は試験があるので、遊ぶ＿＿。", options: ["わけにはいかない", "わけがない", "はずがない", "ものではない"], answer: 0, level: "n2", note: L("“〜わけにはいかない” = cannot, for practical or moral reasons.", "「〜わけにはいかない」は事情があって「できない」。", "“〜わけにはいかない” = không thể (vì lý do thực tế/đạo lý).") },
  { sentence: "あの店はいつも込んでいるから、おいしい＿＿。", options: ["に違いない", "ことになる", "わけではない", "かねない"], answer: 0, level: "n2", note: L("“〜に違いない” = must be (strong conviction).", "「〜に違いない」は強い確信。", "“〜に違いない” = chắc chắn là…") },
  { sentence: "留学＿＿、日本に興味を持つようになった。", options: ["をきっかけに", "をめぐって", "にわたって", "に対して"], answer: 0, level: "n2", note: L("“〜をきっかけに” = triggered by / starting with.", "「〜をきっかけに」は契機を表す。", "“〜をきっかけに” = nhân dịp / bắt đầu từ…") },
  { sentence: "先生の質問＿＿、学生は黙っていた。", options: ["に対して", "にとって", "によって", "につれて"], answer: 0, level: "n2", note: L("“〜に対して” = in response to / toward.", "「〜に対して」は対象・反応を表す。", "“〜に対して” = đối với / đáp lại…") },
  { sentence: "雨が降ってきたので、試合を中止＿＿。", options: ["せざるを得ない", "しかねない", "するはずがない", "しつつある"], answer: 0, level: "n2", note: L("“〜ざるを得ない” = have no choice but to.", "「〜ざるを得ない」は「〜するしかない」。", "“〜ざるを得ない” = đành phải…") },
  { sentence: "日本の人口は減り＿＿。", options: ["つつある", "かねない", "ざるを得ない", "っぱなし"], answer: 0, level: "n2", note: L("“V-つつある” = is in the process of V-ing.", "「V-つつある」は変化の進行。", "“V-つつある” = đang dần…") },
];

export interface KaiwaScene { npc: string; npcMeaning: LocalizedText; options: { ja: string; ok: boolean }[]; explain: LocalizedText }
export const kaiwa: KaiwaScene[] = [
  { npc: "袋は必要ですか。", npcMeaning: L("Clerk: “Do you need a bag?”", "店員：「袋は必要ですか。」", "Nhân viên: “Bạn có cần túi không?”"), explain: L("A polite yes: “はい、お願いします。” The others are too casual or answer a different question.", "丁寧に答えるなら「はい、お願いします。」。ほかはくだけすぎか、場面に合いません。", "Trả lời lịch sự: “はい、お願いします。”. Các câu còn lại quá suồng sã hoặc không hợp ngữ cảnh."), options: [{ ja: "はい、お願いします。", ok: true }, { ja: "いる。", ok: false }, { ja: "どういたしまして。", ok: false }, { ja: "さようなら。", ok: false }] },
  { npc: "（トイレを探しています）", npcMeaning: L("You are looking for the restroom and ask a staff member.", "トイレを探していて、店員さんに聞きます。", "Bạn đang tìm nhà vệ sinh và hỏi nhân viên."), explain: L("“すみません、〜はどこですか。” is the natural polite way to ask where something is.", "「すみません、〜はどこですか。」が、場所をたずねる自然で丁寧な言い方です。", "“すみません、〜はどこですか。” là cách hỏi vị trí tự nhiên và lịch sự."), options: [{ ja: "トイレどこ？", ok: false }, { ja: "すみません、トイレはどこですか。", ok: true }, { ja: "トイレをください。", ok: false }, { ja: "トイレですか。", ok: false }] },
  { npc: "温めますか。", npcMeaning: L("Clerk: “Shall I heat it up for you?”", "店員：「温めますか。」", "Nhân viên: “Bạn có muốn hâm nóng không?”"), explain: L("“お願いします。” politely accepts an offer. “いただきます” and “ごちそうさまでした” belong to meals.", "申し出を丁寧に受けるなら「お願いします。」。「いただきます」「ごちそうさまでした」は食事のあいさつです。", "“お願いします。” là cách nhận lời đề nghị một cách lịch sự. “いただきます” và “ごちそうさまでした” dùng khi ăn."), options: [{ ja: "いただきます。", ok: false }, { ja: "ごちそうさまでした。", ok: false }, { ja: "お願いします。", ok: true }, { ja: "おやすみなさい。", ok: false }] },
];

export type MissionId = "vocab-n3" | "kanji-n3" | "grammar-n3" | "vocab-n2" | "kanji-n2" | "grammar-n2" | "kaiwa";
export interface Line { id: "n3" | "n2" | "extra"; stations: MissionId[] }
export const lines: Line[] = [
  { id: "n3", stations: ["vocab-n3", "kanji-n3", "grammar-n3"] },
  { id: "n2", stations: ["vocab-n2", "kanji-n2", "grammar-n2"] },
  { id: "extra", stations: ["kaiwa"] },
];
