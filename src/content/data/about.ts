import type { LocalizedText } from "@/lib/localized";

export interface AboutSection {
  id: "story" | "background" | "journey" | "interests" | "values" | "goals";
  /** Owner-written text. Paragraphs are separated by a blank line. Undefined → placeholder slot. */
  body?: LocalizedText;
}

/**
 * English is the owner's own text. Japanese and Vietnamese are drafts translated from it and
 * must be reviewed by the owner / a native speaker before being marked as translated.
 */
export const aboutSections: AboutSection[] = [
  {
    id: "story",
    body: {
      en: `Curious by nature. Always exploring. Still becoming.

I've always been curious about how things work. What started with watching movies, playing games, and tinkering with computers eventually led me to programming, software development, and a broader exploration of technology.`,
      ja: { status: "draft", text: `生まれつき好奇心旺盛で、いつも何かを探していて、まだ成長の途中です。

物事がどう動いているのか、昔から気になっていました。映画を観たり、ゲームをしたり、パソコンをいじったりすることから始まり、やがてプログラミングやソフトウェア開発、そしてテクノロジー全体への探求へとつながりました。` },
      vi: { status: "draft", text: `Tò mò từ bản tính. Luôn khám phá. Vẫn đang trở thành.

Mình luôn tò mò về cách mọi thứ vận hành. Từ việc xem phim, chơi game và mày mò máy tính, mình dần đến với lập trình, phát triển phần mềm và rộng hơn là khám phá công nghệ.` },
    },
  },
  {
    id: "background",
    body: {
      en: `I'm a fourth-year IT student from Vietnam, interested in technology, software, and the many things beyond them.

Today, I'm exploring different areas of technology, from web development and AI-assisted development to 3D modeling and simulation. I'm also gaining practical experience in a Japanese working environment, where I'm learning not only technical skills but also communication, discipline, and how to approach problems more thoughtfully.`,
      ja: { status: "draft", text: `ベトナム出身の IT 学部 4 年生で、テクノロジーやソフトウェア、そしてそれ以外の多くのことに興味があります。

現在は、Web 開発、AI を活用した開発、3D モデリング、シミュレーションなど、さまざまな分野を探っています。また、日本の職場環境で実務経験を積んでおり、技術だけでなく、コミュニケーションや規律、物事により丁寧に向き合う方法も学んでいます。` },
      vi: { status: "draft", text: `Mình là sinh viên năm cuối ngành CNTT đến từ Việt Nam, quan tâm đến công nghệ, phần mềm và nhiều điều xa hơn thế.

Hiện mình đang khám phá nhiều mảng công nghệ, từ phát triển web và phát triển có hỗ trợ AI đến mô hình hóa 3D và mô phỏng. Mình cũng đang tích lũy kinh nghiệm thực tế trong môi trường làm việc Nhật Bản, nơi mình học không chỉ kỹ năng kỹ thuật mà cả giao tiếp, kỷ luật và cách tiếp cận vấn đề chín chắn hơn.` },
    },
  },
  {
    id: "journey",
    body: {
      en: `My journey hasn't been particularly straightforward. I started programming without really understanding what I was doing. I followed tutorials, copied code, struggled with fundamentals, and sometimes questioned whether I had chosen the right path.

But I never quite lost my interest in computers.

Along the way, I unexpectedly discovered another passion: Japanese language and culture. What initially began as an interest in anime gradually became something much more meaningful. It introduced me to new people, different ways of learning, and opportunities I hadn't imagined before.`,
      ja: { status: "draft", text: `私の道のりは、決してまっすぐではありませんでした。何をしているのかよく分からないままプログラミングを始め、チュートリアルをなぞり、コードをコピーし、基礎でつまずき、この道で合っているのかと迷うこともありました。

それでも、コンピューターへの興味を失うことはありませんでした。

その途中で、思いがけずもう一つの情熱、日本語と日本の文化に出会いました。最初はアニメへの興味から始まりましたが、次第にもっと大きな意味を持つものになりました。新しい出会いや、さまざまな学び方、想像もしなかった機会をもたらしてくれました。` },
      vi: { status: "draft", text: `Hành trình của mình không hẳn thẳng tắp. Mình bắt đầu lập trình mà chưa thật sự hiểu mình đang làm gì: làm theo hướng dẫn, chép code, vật lộn với kiến thức nền tảng, và đôi lúc tự hỏi liệu mình đã chọn đúng đường chưa.

Nhưng mình chưa bao giờ hết hứng thú với máy tính.

Trên đường đi, mình bất ngờ tìm thấy một niềm đam mê khác: tiếng Nhật và văn hóa Nhật Bản. Ban đầu chỉ là sự yêu thích anime, rồi dần trở thành điều có ý nghĩa hơn nhiều. Nó đưa mình đến với những người mới, những cách học khác và những cơ hội mình chưa từng nghĩ tới.` },
    },
  },
  {
    id: "interests",
    body: {
      en: `Outside of programming, I enjoy anime, films, Japanese music, language learning, and exploring different subjects.

I tend to be selective about the movies I watch, and when something catches my attention, I often spend more time exploring its interpretations, hidden details, soundtrack, and underlying ideas.

I enjoy discovering things I don't know yet, whether they're close to home or somewhere entirely unfamiliar.`,
      ja: { status: "draft", text: `プログラミング以外では、アニメ、映画、日本の音楽、語学学習、さまざまな分野を調べることが好きです。

観る映画は選ぶ方で、気になる作品があると、解釈や隠された細部、サウンドトラック、根底にある考えまで時間をかけて掘り下げます。

まだ知らないことを見つけるのが好きです。身近なことでも、まったく未知のことでも。` },
      vi: { status: "draft", text: `Ngoài lập trình, mình thích anime, phim, nhạc Nhật, học ngôn ngữ và tìm hiểu nhiều chủ đề khác nhau.

Mình khá kén phim, và khi có điều gì thu hút, mình thường dành nhiều thời gian tìm hiểu cách diễn giải, các chi tiết ẩn, nhạc phim và những ý tưởng bên dưới nó.

Mình thích khám phá những điều chưa biết, dù gần gũi hay hoàn toàn xa lạ.` },
    },
  },
  {
    id: "values",
    body: {
      en: `I enjoy taking complicated things apart and understanding what lies beneath the surface.

I'm particularly interested in the small details, the underlying mechanisms, and the connections between seemingly unrelated things.

I like building useful tools, improving existing workflows, and finding ways to make things smoother, more efficient, and more enjoyable.

I'm somewhat of a perfectionist, occasionally spontaneous, and often curious about too many things at once. I'm still learning how to balance all of that.`,
      ja: { status: "draft", text: `複雑なものを分解して、表面の下にあるものを理解するのが好きです。

特に、細部、その裏にある仕組み、一見無関係に見えるもの同士のつながりに惹かれます。

役に立つツールを作ったり、既存のワークフローを改善したりして、物事をよりスムーズで効率的、そして楽しいものにする方法を探すのが好きです。

やや完璧主義で、ときに衝動的、そして同時にあまりにも多くのことに興味を持ちがちです。そのバランスの取り方は、今も勉強中です。` },
      vi: { status: "draft", text: `Mình thích tháo rời những thứ phức tạp và hiểu điều nằm bên dưới bề mặt.

Mình đặc biệt quan tâm đến các chi tiết nhỏ, cơ chế bên trong và mối liên hệ giữa những thứ tưởng như không liên quan.

Mình thích xây dựng công cụ hữu ích, cải thiện quy trình sẵn có và tìm cách làm mọi thứ mượt mà, hiệu quả và thú vị hơn.

Mình khá cầu toàn, đôi khi bộc phát, và thường tò mò về quá nhiều thứ cùng lúc. Mình vẫn đang học cách cân bằng tất cả những điều đó.` },
    },
  },
  {
    id: "goals",
    body: {
      en: `I don't have everything figured out, and I'm okay with that.

I'd like to continue growing as an engineer, improve my Japanese, experience life in Japan, and explore more of the world around me.

More importantly, I want to become someone who can turn curiosity into meaningful things — things that solve problems, make life better, and perhaps create value for others.

I believe that if every day looks exactly the same, eventually I'll become exactly the same person.

So, I try to make tomorrow a little different from yesterday.

This is a place to collect what I learn, what I build, what I love, and everything I'm still figuring out.`,
      ja: { status: "draft", text: `すべてが分かっているわけではありませんが、それでいいと思っています。

エンジニアとして成長し続け、日本語を上達させ、日本での生活を経験し、身の回りの世界をもっと探求したいです。

それ以上に、好奇心を意味のあるものに変えられる人になりたいです。問題を解決し、暮らしをより良くし、できれば誰かの価値になるようなものに。

毎日がまったく同じなら、いずれ自分もまったく同じ人間のままだと信じています。

だから、明日を昨日より少しだけ違うものにしようと心がけています。

ここは、学んだこと、作ったもの、好きなもの、そしてまだ模索中のすべてを集める場所です。` },
      vi: { status: "draft", text: `Mình chưa có mọi câu trả lời, và mình thấy ổn với điều đó.

Mình muốn tiếp tục trưởng thành như một kỹ sư, cải thiện tiếng Nhật, trải nghiệm cuộc sống ở Nhật và khám phá thêm thế giới xung quanh.

Quan trọng hơn, mình muốn trở thành người biến sự tò mò thành những điều có ý nghĩa: giải quyết vấn đề, làm cuộc sống tốt hơn và có thể tạo giá trị cho người khác.

Mình tin rằng nếu ngày nào cũng giống hệt nhau, rồi mình cũng sẽ mãi là chính mình như cũ.

Vì vậy, mình cố làm cho ngày mai khác ngày hôm qua một chút.

Đây là nơi gom lại những gì mình học, những gì mình xây dựng, những gì mình yêu thích và mọi thứ mình vẫn đang tìm hiểu.` },
    },
  },
];
