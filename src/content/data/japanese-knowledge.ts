import type { LocalizedText } from "@/lib/localized";

/** Reference content about the Japanese language (general knowledge, not personal claims). ja/vi are drafts until reviewed. */
const L = (en: string, ja: string, vi: string): LocalizedText => ({ en, ja: { text: ja, status: "draft" }, vi: { text: vi, status: "draft" } });

export interface Particle { p: string; romaji: string; role: LocalizedText; ja: string; ex: string; exRomaji: string; meaning: LocalizedText }
export const particles: Particle[] = [
  { p: "は", romaji: "wa", role: L("topic marker", "主題を示す", "đánh dấu chủ đề"), ja: "私は学生です。", ex: "私は学生です。", exRomaji: "Watashi wa gakusei desu.", meaning: L("I am a student.", "私は学生です。（私について話す）", "Tôi là sinh viên.") },
  { p: "が", romaji: "ga", role: L("subject marker (new information, emphasis)", "主語を示す（新情報・強調）", "đánh dấu chủ ngữ (thông tin mới, nhấn mạnh)"), ja: "猫がいます。", ex: "猫がいます。", exRomaji: "Neko ga imasu.", meaning: L("There is a cat.", "猫がいる。", "Có một con mèo.") },
  { p: "を", romaji: "o", role: L("direct object", "目的語を示す", "tân ngữ trực tiếp"), ja: "水を飲みます。", ex: "水を飲みます。", exRomaji: "Mizu o nomimasu.", meaning: L("I drink water.", "水を飲む。", "Tôi uống nước.") },
  { p: "に", romaji: "ni", role: L("time, destination, target, place of existence", "時間・目的地・相手・存在の場所", "thời điểm, đích đến, đối tượng, nơi tồn tại"), ja: "七時に起きます。", ex: "七時に起きます。", exRomaji: "Shichiji ni okimasu.", meaning: L("I get up at seven.", "七時に起きる。", "Tôi dậy lúc bảy giờ.") },
  { p: "で", romaji: "de", role: L("place of action, means", "動作の場所・手段", "nơi diễn ra hành động, phương tiện"), ja: "学校で勉強します。", ex: "学校で勉強します。", exRomaji: "Gakkō de benkyō shimasu.", meaning: L("I study at school.", "学校で勉強する。", "Tôi học ở trường.") },
  { p: "へ", romaji: "e", role: L("direction", "方向", "hướng đi"), ja: "日本へ行きます。", ex: "日本へ行きます。", exRomaji: "Nihon e ikimasu.", meaning: L("I am going to Japan.", "日本の方向に行く。", "Tôi đi Nhật Bản.") },
  { p: "の", romaji: "no", role: L("possession, modification", "所有・修飾", "sở hữu, bổ nghĩa"), ja: "私の本です。", ex: "私の本です。", exRomaji: "Watashi no hon desu.", meaning: L("It is my book.", "私の本だ。", "Đây là sách của tôi.") },
  { p: "と", romaji: "to", role: L("“and” (nouns), “with”, quotation", "「と」（名詞の並列）・共同・引用", "“và” (danh từ), “cùng với”, trích dẫn"), ja: "友達と話します。", ex: "友達と話します。", exRomaji: "Tomodachi to hanashimasu.", meaning: L("I talk with a friend.", "友達といっしょに話す。", "Tôi nói chuyện với bạn.") },
  { p: "も", romaji: "mo", role: L("“also”, “too”", "「〜も」（同じ）", "“cũng”"), ja: "私も行きます。", ex: "私も行きます。", exRomaji: "Watashi mo ikimasu.", meaning: L("I will go too.", "私も行く。", "Tôi cũng đi.") },
  { p: "から", romaji: "kara", role: L("“from”, “because”", "起点・理由", "“từ”, “bởi vì”"), ja: "九時から始まります。", ex: "九時から始まります。", exRomaji: "Kuji kara hajimarimasu.", meaning: L("It starts from nine.", "九時に始まる。", "Nó bắt đầu từ chín giờ.") },
  { p: "まで", romaji: "made", role: L("“until”, “up to”", "終点・期限", "“đến”, “cho đến khi”"), ja: "五時まで働きます。", ex: "五時まで働きます。", exRomaji: "Goji made hatarakimasu.", meaning: L("I work until five.", "五時まで働く。", "Tôi làm việc đến năm giờ.") },
  { p: "か", romaji: "ka", role: L("question marker", "疑問を示す", "đánh dấu câu hỏi"), ja: "学生ですか。", ex: "学生ですか。", exRomaji: "Gakusei desu ka?", meaning: L("Are you a student?", "学生ですか。", "Bạn là sinh viên à?") },
];

export interface VerbRow { dict: string; reading: string; group: "ichidan" | "godan" | "irregular"; polite: string; negative: string; past: string; te: string; meaning: LocalizedText }
export const verbs: VerbRow[] = [
  { dict: "食べる", reading: "taberu", group: "ichidan", polite: "食べます", negative: "食べません", past: "食べました", te: "食べて", meaning: L("to eat", "食べる", "ăn") },
  { dict: "飲む", reading: "nomu", group: "godan", polite: "飲みます", negative: "飲みません", past: "飲みました", te: "飲んで", meaning: L("to drink", "飲む", "uống") },
  { dict: "する", reading: "suru", group: "irregular", polite: "します", negative: "しません", past: "しました", te: "して", meaning: L("to do", "する", "làm") },
  { dict: "来る", reading: "kuru", group: "irregular", polite: "来ます", negative: "来ません", past: "来ました", te: "来て", meaning: L("to come", "来る", "đến") },
];

export interface Phrase { ja: string; romaji: string; meaning: LocalizedText; when: LocalizedText }
export const phrases: Phrase[] = [
  { ja: "おはようございます", romaji: "Ohayō gozaimasu", meaning: L("Good morning (polite)", "朝のあいさつ（丁寧）", "Chào buổi sáng (lịch sự)"), when: L("morning", "朝", "buổi sáng") },
  { ja: "こんにちは", romaji: "Konnichiwa", meaning: L("Hello / good afternoon", "昼のあいさつ", "Xin chào / chào buổi chiều"), when: L("daytime", "昼", "ban ngày") },
  { ja: "こんばんは", romaji: "Konbanwa", meaning: L("Good evening", "夜のあいさつ", "Chào buổi tối"), when: L("evening", "夜", "buổi tối") },
  { ja: "はじめまして", romaji: "Hajimemashite", meaning: L("Nice to meet you (first meeting)", "初対面のあいさつ", "Rất vui được gặp (lần đầu)"), when: L("first meeting", "初対面", "lần đầu gặp") },
  { ja: "よろしくお願いします", romaji: "Yoroshiku onegaishimasu", meaning: L("Please treat me well / nice to meet you", "これからお世話になるときの決まり文句", "Mong được giúp đỡ / rất mong được quan tâm"), when: L("introductions, requests", "自己紹介・依頼", "giới thiệu, nhờ vả") },
  { ja: "ありがとうございます", romaji: "Arigatō gozaimasu", meaning: L("Thank you (polite)", "お礼（丁寧）", "Cảm ơn (lịch sự)"), when: L("thanks", "お礼", "cảm ơn") },
  { ja: "すみません", romaji: "Sumimasen", meaning: L("Excuse me / I'm sorry", "呼びかけ・謝罪", "Xin lỗi / làm phiền"), when: L("getting attention, apologising", "呼びかけ・謝罪", "gọi ai đó, xin lỗi") },
  { ja: "お願いします", romaji: "Onegaishimasu", meaning: L("Please (making a request)", "お願いするとき", "Làm ơn (khi nhờ)"), when: L("requests", "依頼", "nhờ vả") },
  { ja: "いただきます", romaji: "Itadakimasu", meaning: L("Said before eating", "食べる前のあいさつ", "Câu nói trước khi ăn"), when: L("before a meal", "食事の前", "trước bữa ăn") },
  { ja: "ごちそうさまでした", romaji: "Gochisōsama deshita", meaning: L("Said after eating", "食べたあとのあいさつ", "Câu nói sau khi ăn"), when: L("after a meal", "食事のあと", "sau bữa ăn") },
  { ja: "お疲れ様です", romaji: "Otsukaresama desu", meaning: L("“Thanks for your hard work” (workplace greeting)", "仕事での労いのあいさつ", "“Cảm ơn vì đã vất vả” (chào hỏi ở nơi làm việc)"), when: L("workplace", "職場", "nơi làm việc") },
];

export interface Politeness { id: "casual" | "polite" | "keigo"; example: string; example2?: string }
export const politeness: Politeness[] = [
  { id: "casual", example: "食べる" },
  { id: "polite", example: "食べます" },
  { id: "keigo", example: "召し上がる（尊敬語）", example2: "いただく（謙譲語）" },
];
