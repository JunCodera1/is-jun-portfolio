import type { LocalizedText } from "@/lib/localized";
import type { Project } from "./types";

/**
 * Featured projects. Every statement here was checked against a manifest, file tree or source file
 * of the public repository (see PROJECTS_REVIEW.md → "Verified"). README-only claims are deliberately absent.
 * Add, remove or reorder entries freely: the order of this array is the order on the site.
 *
 * ja/vi strings are drafts written for this site and are marked `draft` until the owner reviews them.
 */
const d = (text: string) => ({ text, status: "draft" as const });
const O = "JunCodera1";

export const projects: Project[] = [
  {
    slug: "green-footprint",
    name: "Green Footprint",
    kinds: ["web", "backend"],
    repos: [`${O}/green-footprint`, `${O}/green-footprint-backend`],
    featured: true,
    summary: {
      en: "A web application built around environmental activities and goals: a React + TypeScript front end and a separate Express + TypeScript API that stores its data in PostgreSQL through Prisma.",
      ja: d("環境に配慮した行動と目標を軸にしたWebアプリケーションです。React + TypeScript のフロントエンドと、Prisma 経由で PostgreSQL にデータを保存する Express + TypeScript の API を分離して構成しています。"),
      vi: d("Ứng dụng web xoay quanh các hoạt động và mục tiêu vì môi trường: front end React + TypeScript và một API Express + TypeScript riêng, lưu dữ liệu vào PostgreSQL thông qua Prisma."),
    },
    highlights: [
      {
        en: "The API is organised as feature modules — activities, auth, files, goals, home, mailer, posts, profiles, users — with shared config, database and middleware layers.",
        ja: d("API は機能別モジュール（activities、auth、files、goals、home、mailer、posts、profiles、users）で構成され、設定・データベース・ミドルウェアの層を共有しています。"),
        vi: d("API được tổ chức theo module chức năng — activities, auth, files, goals, home, mailer, posts, profiles, users — cùng các tầng cấu hình, cơ sở dữ liệu và middleware dùng chung."),
      },
      {
        en: "A Prisma schema models User, Post, Profile, Activity, Goal and GoalProgress with enums for activity type, goal category, verification status and recurrence, plus a committed SQL migration.",
        ja: d("Prisma スキーマで User、Post、Profile、Activity、Goal、GoalProgress をモデル化し、活動種別・目標カテゴリ・検証状態・繰り返しを enum で表現。SQL マイグレーションもコミットされています。"),
        vi: d("Schema Prisma mô hình hoá User, Post, Profile, Activity, Goal và GoalProgress, với enum cho loại hoạt động, nhóm mục tiêu, trạng thái xác minh và chu kỳ lặp, kèm một migration SQL đã commit."),
      },
      {
        en: "Backend tooling: Joi validation, JWT authentication with bcryptjs, Winston logging, a Jest test setup, Docker and docker-compose files, a Nix flake and Hygen generators for new modules.",
        ja: d("バックエンドの周辺ツール：Joi による検証、bcryptjs と JWT による認証、Winston ロギング、Jest のテスト環境、Docker / docker-compose、Nix flake、新規モジュール用の Hygen ジェネレーター。"),
        vi: d("Công cụ phía backend: kiểm tra dữ liệu bằng Joi, xác thực JWT với bcryptjs, ghi log bằng Winston, cấu hình test Jest, Docker và docker-compose, Nix flake và bộ sinh mã Hygen cho module mới."),
      },
      {
        en: "The front end combines React Router, Tailwind CSS, three.js through react-three-fiber, Chart.js and Recharts charts and Leaflet maps.",
        ja: d("フロントエンドは React Router、Tailwind CSS、react-three-fiber 経由の three.js、Chart.js / Recharts のグラフ、Leaflet の地図を組み合わせています。"),
        vi: d("Front end kết hợp React Router, Tailwind CSS, three.js qua react-three-fiber, biểu đồ Chart.js và Recharts cùng bản đồ Leaflet."),
      },
    ],
    stack: [
      { name: "React", evidence: "package.json", repo: "green-footprint" },
      { name: "TypeScript", evidence: "tsconfig.json", repo: "green-footprint" },
      { name: "Vite", evidence: "vite.config.ts", repo: "green-footprint" },
      { name: "Tailwind CSS", evidence: "tailwind.config.js", repo: "green-footprint" },
      { name: "three.js", evidence: "package.json (three, @react-three/fiber)", repo: "green-footprint" },
      { name: "Express", evidence: "src/server.ts", repo: "green-footprint-backend" },
      { name: "Prisma", evidence: "src/database/prisma/schema.prisma", repo: "green-footprint-backend" },
      { name: "PostgreSQL", evidence: "schema.prisma (provider = postgresql)", repo: "green-footprint-backend" },
      { name: "Jest", evidence: "jest.config.js", repo: "green-footprint-backend" },
      { name: "Docker", evidence: "Dockerfile, docker-compose.yml", repo: "green-footprint-backend" },
    ],
    caseStudy: {
      overview: {
        en: "Two repositories make one product: green-footprint (the website) and green-footprint-backend (its API). The website is deployed on Vercel; the API ships with Docker and docker-compose files.",
        ja: d("二つのリポジトリで一つのプロダクトを構成しています。green-footprint（Webサイト）と green-footprint-backend（API）です。サイトは Vercel にデプロイされ、API には Docker / docker-compose の設定が付属します。"),
        vi: d("Hai repository tạo nên một sản phẩm: green-footprint (website) và green-footprint-backend (API). Website được triển khai trên Vercel; API đi kèm tệp Docker và docker-compose."),
      },
      architecture: {
        en: "Front end: src/ is split into components, features, pages, services, hooks, contexts and lib. Back end: src/modules/<feature> for each domain, src/config for app, auth, database, mail and logging settings, src/database for the Prisma service and migrations.",
        ja: d("フロントエンド：src/ を components、features、pages、services、hooks、contexts、lib に分割。バックエンド：ドメインごとに src/modules/<feature>、アプリ・認証・DB・メール・ログの設定は src/config、Prisma サービスとマイグレーションは src/database に置いています。"),
        vi: d("Front end: src/ chia thành components, features, pages, services, hooks, contexts và lib. Back end: src/modules/<feature> cho từng miền nghiệp vụ, src/config cho cấu hình ứng dụng, xác thực, cơ sở dữ liệu, mail và log, src/database cho dịch vụ Prisma và các migration."),
      },
    },
    demo: { url: "https://green-footprint-juncodera1s-projects.vercel.app/", checkedAt: "2026-11-12" },
  },
  {
    slug: "deepsea",
    name: "DeepSea",
    kinds: ["mobile", "backend"],
    repos: [`${O}/DeepSea`, `${O}/DeepSea-RestAPI`],
    featured: true,
    summary: {
      en: "A language-learning Android app written entirely in Kotlin with Jetpack Compose, paired with a Kotlin Spring Boot REST API that handles authentication, persistence and payments.",
      ja: d("全体を Kotlin で書き、Jetpack Compose で構築した語学学習 Android アプリです。認証・永続化・決済を担う Kotlin / Spring Boot の REST API と組み合わせています。"),
      vi: d("Ứng dụng Android học ngoại ngữ viết hoàn toàn bằng Kotlin với Jetpack Compose, đi cùng một REST API Kotlin Spring Boot xử lý xác thực, lưu trữ và thanh toán."),
    },
    highlights: [
      {
        en: "Android client: Compose with Material 3, Navigation Compose, Retrofit with Gson converters, DataStore, WorkManager, Hilt, Coil, Stripe, Cloudinary, and Google and Facebook sign-in SDKs.",
        ja: d("Android クライアント：Material 3 の Compose、Navigation Compose、Gson コンバーター付き Retrofit、DataStore、WorkManager、Hilt、Coil、Stripe、Cloudinary、Google / Facebook ログイン SDK。"),
        vi: d("Ứng dụng Android: Compose với Material 3, Navigation Compose, Retrofit cùng bộ chuyển đổi Gson, DataStore, WorkManager, Hilt, Coil, Stripe, Cloudinary và SDK đăng nhập Google, Facebook."),
      },
      {
        en: "REST API on Spring Boot 3.4 with Spring Data JPA, Spring Security, OAuth2 client and resource server, JWT (jjwt), validation, mail and a PostgreSQL driver.",
        ja: d("Spring Boot 3.4 の REST API。Spring Data JPA、Spring Security、OAuth2 クライアント／リソースサーバー、JWT（jjwt）、バリデーション、メール、PostgreSQL ドライバーを使用しています。"),
        vi: d("REST API trên Spring Boot 3.4 với Spring Data JPA, Spring Security, OAuth2 client và resource server, JWT (jjwt), validation, mail và driver PostgreSQL."),
      },
      {
        en: "The API follows a layered package layout — controller, service, repository, entity, dto, mapper, config, exception — and also serves a TypeScript admin dashboard from its static resources.",
        ja: d("API は controller、service、repository、entity、dto、mapper、config、exception という層構造のパッケージで構成され、静的リソースとして TypeScript 製の管理ダッシュボードも配信します。"),
        vi: d("API theo cấu trúc package phân tầng — controller, service, repository, entity, dto, mapper, config, exception — và còn phục vụ một dashboard quản trị viết bằng TypeScript từ thư mục tài nguyên tĩnh."),
      },
    ],
    stack: [
      { name: "Kotlin", evidence: "GitHub language breakdown (100% Kotlin)", repo: "DeepSea" },
      { name: "Jetpack Compose", evidence: "app/build.gradle.kts (compose = true, compose BOM)", repo: "DeepSea" },
      { name: "Retrofit", evidence: "app/build.gradle.kts", repo: "DeepSea" },
      { name: "Hilt", evidence: "app/build.gradle.kts (hilt-work, hilt-compiler via KSP)", repo: "DeepSea" },
      { name: "Spring Boot 3.4", evidence: "build.gradle.kts", repo: "DeepSea-RestAPI" },
      { name: "Spring Security + OAuth2", evidence: "build.gradle.kts", repo: "DeepSea-RestAPI" },
      { name: "Spring Data JPA", evidence: "build.gradle.kts", repo: "DeepSea-RestAPI" },
      { name: "PostgreSQL", evidence: "build.gradle.kts (org.postgresql:postgresql)", repo: "DeepSea-RestAPI" },
      { name: "Stripe", evidence: "build.gradle.kts (stripe-java, stripe-android)", repo: "DeepSea-RestAPI" },
    ],
    caseStudy: {
      overview: {
        en: "Two repositories: DeepSea (the Android app) and DeepSea-RestAPI (the Spring Boot service). Which features are finished is for the owner to state — only what the manifests and source tree prove is listed here.",
        ja: d("二つのリポジトリで構成：DeepSea（Android アプリ）と DeepSea-RestAPI（Spring Boot サービス）。どの機能が完成しているかは作者が記載する項目で、ここにはマニフェストとソースツリーで確認できる内容のみを載せています。"),
        vi: d("Hai repository: DeepSea (ứng dụng Android) và DeepSea-RestAPI (dịch vụ Spring Boot). Tính năng nào đã hoàn thiện là phần chủ trang cần tự ghi — ở đây chỉ liệt kê những gì manifest và cây mã nguồn chứng minh được."),
      },
      architecture: {
        en: "Android: app/src/main/java/com/example/deepsea/{data, ui, utils}. API: com.example.deepsea.{controller, service, repository, entity, dto, mapper, config, exception, enums, annotations, util}.",
        ja: d("Android：app/src/main/java/com/example/deepsea/{data, ui, utils}。API：com.example.deepsea.{controller, service, repository, entity, dto, mapper, config, exception, enums, annotations, util}。"),
        vi: d("Android: app/src/main/java/com/example/deepsea/{data, ui, utils}. API: com.example.deepsea.{controller, service, repository, entity, dto, mapper, config, exception, enums, annotations, util}."),
      },
    },
  },
  {
    slug: "voiceai",
    name: "VoiceAI",
    kinds: ["ml", "backend"],
    repos: [`${O}/speech-language-model`],
    featured: true,
    summary: {
      en: "A spoken-language identification and transcription pipeline: a SpeechBrain ECAPA-TDNN classifier trained for five languages, followed by Whisper transcription, exposed through a FastAPI service.",
      ja: d("話し言葉の言語識別と文字起こしのパイプラインです。5言語向けに学習した SpeechBrain の ECAPA-TDNN 分類器で言語を判定し、Whisper で文字起こしを行い、FastAPI サービスとして公開します。"),
      vi: d("Pipeline nhận diện ngôn ngữ nói và chép lời: bộ phân loại ECAPA-TDNN của SpeechBrain huấn luyện cho năm ngôn ngữ, sau đó chép lời bằng Whisper, cung cấp qua dịch vụ FastAPI."),
    },
    highlights: [
      {
        en: "Training configuration in hparams.yaml: 80-band Fbank features, an ECAPA-TDNN embedding model (192-dim) feeding an x-vector classifier with five outputs, spectrogram-drop augmentation, 35 epochs at batch size 32.",
        ja: d("hparams.yaml の学習設定：80 バンドの Fbank 特徴量、192 次元の ECAPA-TDNN 埋め込み、5 出力の x-vector 分類器、スペクトログラムドロップによるデータ拡張、35 エポック・バッチサイズ 32。"),
        vi: d("Cấu hình huấn luyện trong hparams.yaml: đặc trưng Fbank 80 băng, mô hình embedding ECAPA-TDNN 192 chiều đưa vào bộ phân loại x-vector năm đầu ra, tăng cường dữ liệu bằng spectrogram-drop, 35 epoch với batch size 32."),
      },
      {
        en: "A complete workflow in scripts: create_csv.py (dataset splits), train.py, run_test.py (evaluation), quantize_model.py and quantize_evaluate.py (INT8 post-training quantization), and measure_latency.py. Both the FP32 and INT8 model files are in the repository.",
        ja: d("ワークフロー一式がスクリプトとして揃っています：create_csv.py（データ分割）、train.py、run_test.py（評価）、quantize_model.py / quantize_evaluate.py（INT8 の学習後量子化）、measure_latency.py。FP32 と INT8 のモデルファイルもリポジトリにあります。"),
        vi: d("Quy trình đầy đủ nằm trong các script: create_csv.py (chia tập dữ liệu), train.py, run_test.py (đánh giá), quantize_model.py và quantize_evaluate.py (lượng tử hoá INT8 sau huấn luyện) và measure_latency.py. Cả hai tệp mô hình FP32 và INT8 đều có trong repository."),
      },
      {
        en: "web_app/server.py is a FastAPI app with /predict and /predict-stream endpoints; it converts incoming audio, predicts the language, then transcribes with a Hugging Face Whisper pipeline (openai/whisper-base). A Dockerfile and compose file are included.",
        ja: d("web_app/server.py は /predict と /predict-stream を持つ FastAPI アプリで、受け取った音声を変換して言語を判定し、Hugging Face の Whisper パイプライン（openai/whisper-base）で文字起こしします。Dockerfile と compose ファイル付き。"),
        vi: d("web_app/server.py là ứng dụng FastAPI có endpoint /predict và /predict-stream; nó chuyển đổi âm thanh đầu vào, dự đoán ngôn ngữ rồi chép lời bằng pipeline Whisper của Hugging Face (openai/whisper-base). Có kèm Dockerfile và tệp compose."),
      },
    ],
    stack: [
      { name: "Python", evidence: "requirements.txt", repo: "speech-language-model" },
      { name: "SpeechBrain", evidence: "requirements.txt, hparams.yaml", repo: "speech-language-model" },
      { name: "ECAPA-TDNN", evidence: "hparams.yaml (speechbrain.lobes.models.ECAPA_TDNN)", repo: "speech-language-model" },
      { name: "Whisper (via transformers)", evidence: "web_app/server.py (openai/whisper-base)", repo: "speech-language-model" },
      { name: "FastAPI", evidence: "requirements.txt, web_app/server.py", repo: "speech-language-model" },
      { name: "Docker", evidence: "Dockerfile, compose.yaml", repo: "speech-language-model" },
    ],
    caseStudy: {
      overview: {
        en: "Language identification for five languages (the training config's comment names English, Japanese, Korean, Vietnamese and Chinese), with a Whisper step on top. Accuracy and latency figures appear only in the README and have not been verified here, so they are not shown.",
        ja: d("5言語（学習設定のコメントでは英語・日本語・韓国語・ベトナム語・中国語）の言語識別に、Whisper の工程を重ねた構成です。精度やレイテンシの数値は README にしかなく、ここでは未検証のため掲載していません。"),
        vi: d("Nhận diện năm ngôn ngữ (chú thích trong cấu hình huấn luyện nêu tiếng Anh, Nhật, Hàn, Việt và Trung) cùng bước chép lời bằng Whisper. Các số liệu độ chính xác và độ trễ chỉ có trong README và chưa được kiểm chứng ở đây nên không hiển thị."),
      },
      implementation: {
        en: "Pipeline: audio upload → FFmpeg conversion to 16 kHz mono WAV → ECAPA-TDNN language prediction → language hint passed to Whisper → JSON response. Quantization scripts produce an INT8 model for comparison with the FP32 original.",
        ja: d("処理の流れ：音声アップロード → FFmpeg による 16kHz モノラル WAV への変換 → ECAPA-TDNN による言語予測 → 言語ヒントを Whisper に渡す → JSON で応答。量子化スクリプトが FP32 の元モデルと比較するための INT8 モデルを生成します。"),
        vi: d("Luồng xử lý: tải âm thanh lên → FFmpeg chuyển sang WAV 16 kHz mono → dự đoán ngôn ngữ bằng ECAPA-TDNN → truyền gợi ý ngôn ngữ cho Whisper → trả về JSON. Các script lượng tử hoá tạo mô hình INT8 để so sánh với bản FP32 gốc."),
      },
    },
  },
  {
    slug: "nexus-banking",
    name: "Nexus Banking",
    kinds: ["database", "web"],
    repos: [`${O}/bank_system`],
    featured: true,
    summary: {
      en: "A banking-style database project: a PostgreSQL schema that enforces its rules inside the database (constraints, triggers, an atomic transfer function, an audit log) with a small Next.js app on top.",
      ja: d("銀行業務を題材にしたデータベースプロジェクトです。制約・トリガー・アトミックな送金関数・監査ログといったルールを PostgreSQL 側で強制し、その上に小さな Next.js アプリを載せています。"),
      vi: d("Dự án cơ sở dữ liệu theo mô hình ngân hàng: schema PostgreSQL tự thực thi các quy tắc ngay trong cơ sở dữ liệu (ràng buộc, trigger, hàm chuyển tiền nguyên tử, nhật ký kiểm toán) với một ứng dụng Next.js nhỏ phía trên."),
    },
    highlights: [
      {
        en: "Six tables — Customers, Tellers, Account_Types, Accounts, Transactions, Audit_Logs — with UUID primary keys (gen_random_uuid), status CHECK constraints, CHECK (balance >= 0), and six indexes.",
        ja: d("Customers、Tellers、Account_Types、Accounts、Transactions、Audit_Logs の6テーブル。UUID 主キー（gen_random_uuid）、status の CHECK 制約、CHECK (balance >= 0)、6つのインデックスを備えています。"),
        vi: d("Sáu bảng — Customers, Tellers, Account_Types, Accounts, Transactions, Audit_Logs — với khoá chính UUID (gen_random_uuid), ràng buộc CHECK cho status, CHECK (balance >= 0) và sáu chỉ mục."),
      },
      {
        en: "PL/pgSQL: fn_update_balance and fn_log_account_changes run from triggers; fn_transfer_money validates both accounts and the balance, raises exceptions and rolls back on failure.",
        ja: d("PL/pgSQL：fn_update_balance と fn_log_account_changes はトリガーから実行され、fn_transfer_money は両口座と残高を検証し、失敗時は例外を送出してロールバックします。"),
        vi: d("PL/pgSQL: fn_update_balance và fn_log_account_changes chạy từ trigger; fn_transfer_money kiểm tra cả hai tài khoản và số dư, ném ngoại lệ và rollback khi thất bại."),
      },
      {
        en: "A view, v_customer_summary, provides reporting. The web/ app is Next.js with the pg driver and talks to PostgreSQL directly; docker-compose.yml runs the database.",
        ja: d("ビュー v_customer_summary がレポート用途を担います。web/ は Next.js と pg ドライバーで PostgreSQL に直接接続し、docker-compose.yml でデータベースを起動します。"),
        vi: d("View v_customer_summary phục vụ báo cáo. Ứng dụng web/ dùng Next.js với driver pg và kết nối thẳng tới PostgreSQL; docker-compose.yml chạy cơ sở dữ liệu."),
      },
    ],
    stack: [
      { name: "PostgreSQL", evidence: "init.sql, docker-compose.yml", repo: "bank_system" },
      { name: "PL/pgSQL", evidence: "init.sql (functions + triggers)", repo: "bank_system" },
      { name: "Next.js", evidence: "web/package.json", repo: "bank_system" },
      { name: "node-postgres (pg)", evidence: "web/package.json", repo: "bank_system" },
      { name: "Docker Compose", evidence: "docker-compose.yml", repo: "bank_system" },
    ],
    caseStudy: {
      overview: {
        en: "The interesting work is in init.sql: integrity rules live in the database rather than in application code. The app is a thin client over it.",
        ja: d("見どころは init.sql にあります。整合性のルールをアプリケーションコードではなくデータベースに持たせ、アプリはその上の薄いクライアントです。"),
        vi: d("Phần đáng chú ý nằm ở init.sql: các quy tắc toàn vẹn dữ liệu nằm trong cơ sở dữ liệu thay vì mã ứng dụng. Ứng dụng chỉ là một client mỏng phía trên."),
      },
      implementation: {
        en: "Triggers trg_update_balance and trg_log_account_changes; function fn_transfer_money with explicit RAISE EXCEPTION branches (missing/locked sender, insufficient balance, missing/locked recipient) and an EXCEPTION block that reports the rollback.",
        ja: d("トリガー trg_update_balance と trg_log_account_changes、関数 fn_transfer_money（送金元の不在・凍結、残高不足、送金先の不在・凍結を RAISE EXCEPTION で分岐し、EXCEPTION ブロックでロールバックを報告）。"),
        vi: d("Trigger trg_update_balance và trg_log_account_changes; hàm fn_transfer_money với các nhánh RAISE EXCEPTION tường minh (người gửi không tồn tại/bị khoá, không đủ số dư, người nhận không tồn tại/bị khoá) và khối EXCEPTION báo cáo việc rollback."),
      },
    },
  },
  {
    slug: "yt-bilingual-subtitle",
    name: "YT Bilingual Subtitle",
    kinds: ["extension"],
    repos: [`${O}/dual-transcript-ytb-extensions`],
    featured: true,
    summary: {
      en: "A Firefox extension (Manifest V3) that shows a translated line beneath YouTube's own captions, with a control panel, a translation cache and a transcript log.",
      ja: d("YouTube 標準の字幕の下に翻訳行を表示する Firefox 拡張機能（Manifest V3）です。操作パネル、翻訳キャッシュ、トランスクリプトの記録機能があります。"),
      vi: d("Tiện ích mở rộng Firefox (Manifest V3) hiển thị dòng dịch ngay bên dưới phụ đề gốc của YouTube, kèm bảng điều khiển, bộ nhớ đệm bản dịch và nhật ký phụ đề."),
    },
    highlights: [
      {
        en: "A content script (content.js, ~490 lines) polls the rendered caption segments in the page, translates new text through the translate.googleapis.com endpoint and writes the result into YouTube's caption window.",
        ja: d("コンテンツスクリプト（content.js、約490行）がページに描画された字幕セグメントを定期的に読み取り、新しいテキストを translate.googleapis.com で翻訳して YouTube の字幕ウィンドウに書き込みます。"),
        vi: d("Content script (content.js, khoảng 490 dòng) định kỳ đọc các đoạn phụ đề đã hiển thị trong trang, dịch văn bản mới qua endpoint translate.googleapis.com rồi ghi kết quả vào khung phụ đề của YouTube."),
      },
      {
        en: "Translations are cached in a Map so a repeated sentence is not requested twice; settings, panel position and the last 500 transcript lines persist in localStorage.",
        ja: d("翻訳は Map にキャッシュされ、同じ文を二度リクエストしません。設定、パネル位置、直近500行のトランスクリプトは localStorage に保存されます。"),
        vi: d("Bản dịch được lưu trong Map nên một câu lặp lại không bị gửi yêu cầu hai lần; cài đặt, vị trí bảng điều khiển và 500 dòng phụ đề gần nhất được lưu trong localStorage."),
      },
      {
        en: "Minimal permissions (activeTab, storage; hosts limited to youtube.com and translate.googleapis.com), a build.sh that packages an .xpi, and a published v6.0 release.",
        ja: d("権限は最小限（activeTab、storage。ホストは youtube.com と translate.googleapis.com のみ）。.xpi をパッケージする build.sh と、公開済みの v6.0 リリースがあります。"),
        vi: d("Quyền hạn tối thiểu (activeTab, storage; host chỉ gồm youtube.com và translate.googleapis.com), build.sh đóng gói tệp .xpi và một bản phát hành v6.0 đã công bố."),
      },
    ],
    stack: [
      { name: "JavaScript (WebExtension)", evidence: "manifest.json, content.js", repo: "dual-transcript-ytb-extensions" },
      { name: "Manifest V3", evidence: "manifest.json (manifest_version: 3)", repo: "dual-transcript-ytb-extensions" },
      { name: "Shell (packaging)", evidence: "build.sh", repo: "dual-transcript-ytb-extensions" },
    ],
    caseStudy: {
      overview: {
        en: "A small, self-contained tool. Its only network call is to the translation endpoint; the extension does not use YouTube's API.",
        ja: d("小さく完結したツールです。ネットワーク通信は翻訳エンドポイントへのものだけで、YouTube の API は使用しません。"),
        vi: d("Một công cụ nhỏ, khép kín. Lệnh gọi mạng duy nhất là tới endpoint dịch; tiện ích không dùng API của YouTube."),
      },
    },
  },
  {
    slug: "eduvision",
    name: "EduVision",
    kinds: ["ml", "desktop"],
    repos: [`${O}/EduVision`],
    featured: false,
    summary: {
      en: "A desktop application that runs a Keras model (\"Student Engagement Model\") on webcam frames in real time, with a PyQt6 interface and live pyqtgraph charts.",
      ja: d("Keras モデル（「Student Engagement Model」）をウェブカメラの映像にリアルタイムで適用するデスクトップアプリです。PyQt6 のUIと pyqtgraph によるライブグラフを備えています。"),
      vi: d("Ứng dụng desktop chạy mô hình Keras (\"Student Engagement Model\") trên khung hình webcam theo thời gian thực, giao diện PyQt6 và biểu đồ trực tiếp bằng pyqtgraph."),
    },
    highlights: [
      {
        en: "desktop_app.py runs video capture on a QThread (OpenCV VideoCapture), loads the .h5 model with tf.keras, smooths predictions over a fixed-size window (a deque) and draws a live pyqtgraph line chart.",
        ja: d("desktop_app.py は OpenCV の VideoCapture による映像取得を QThread で実行し、tf.keras で .h5 モデルを読み込み、予測値を固定長ウィンドウ（deque）で平滑化して、pyqtgraph のライブ折れ線グラフに描画します。"),
        vi: d("desktop_app.py chạy việc thu hình (OpenCV VideoCapture) trên QThread, nạp mô hình .h5 bằng tf.keras, làm mượt dự đoán trong một cửa sổ cố định (deque) và vẽ biểu đồ đường trực tiếp bằng pyqtgraph."),
      },
      {
        en: "A separate realtime_detection.py script runs the same model against the webcam without the GUI; requirements_app.txt lists TensorFlow, NumPy, OpenCV, PyQt6, pyqtgraph and pandas.",
        ja: d("realtime_detection.py は GUI なしで同じモデルをウェブカメラに適用する別スクリプトです。requirements_app.txt には TensorFlow、NumPy、OpenCV、PyQt6、pyqtgraph、pandas が記載されています。"),
        vi: d("Script realtime_detection.py riêng chạy cùng mô hình trên webcam mà không có GUI; requirements_app.txt liệt kê TensorFlow, NumPy, OpenCV, PyQt6, pyqtgraph và pandas."),
      },
    ],
    stack: [
      { name: "Python", evidence: "desktop_app.py", repo: "EduVision" },
      { name: "TensorFlow / Keras", evidence: "requirements_app.txt, desktop_app.py", repo: "EduVision" },
      { name: "OpenCV", evidence: "realtime_detection.py (cv2.VideoCapture)", repo: "EduVision" },
      { name: "PyQt6", evidence: "requirements_app.txt, desktop_app.py", repo: "EduVision" },
      { name: "pyqtgraph", evidence: "desktop_app.py", repo: "EduVision" },
    ],
    caseStudy: {
      overview: {
        en: "The repository README describes a larger web and cloud platform (Flask/Django, Docker, AWS/GCP). The code in the repository is the desktop application above, so only that is described here.",
        ja: d("リポジトリの README ではより大きな Web／クラウドのプラットフォーム（Flask/Django、Docker、AWS/GCP）が説明されていますが、実際のコードは上記のデスクトップアプリであるため、ここではそちらだけを説明しています。"),
        vi: d("README của repository mô tả một nền tảng web và cloud lớn hơn (Flask/Django, Docker, AWS/GCP). Mã nguồn thực tế là ứng dụng desktop nêu trên, nên ở đây chỉ mô tả phần đó."),
      },
    },
  },
  {
    slug: "deplao",
    name: "Deplao Messenger",
    kinds: ["desktop", "backend"],
    repos: [`${O}/Deplao`],
    featured: false,
    summary: {
      en: "A chat application with a Python PySide6 desktop client and a Node.js backend built on Express, Socket.IO and PostgreSQL, with JWT authentication and file uploads.",
      ja: d("Python の PySide6 デスクトップクライアントと、Express・Socket.IO・PostgreSQL を使い JWT 認証とファイルアップロードを備えた Node.js バックエンドからなるチャットアプリです。"),
      vi: d("Ứng dụng chat gồm client desktop Python PySide6 và backend Node.js xây trên Express, Socket.IO và PostgreSQL, có xác thực JWT và tải tệp lên."),
    },
    highlights: [
      {
        en: "The backend is split into middleware, routes, services and a socket directory (backend_chat/); the client uses python-socketio and requests and is organised into gui/widgets, interface, models and routes.",
        ja: d("バックエンドは middleware、routes、services、socket ディレクトリ（backend_chat/）に分割され、クライアントは python-socketio と requests を使い、gui/widgets、interface、models、routes で構成されています。"),
        vi: d("Backend chia thành middleware, routes, services và thư mục socket (backend_chat/); client dùng python-socketio và requests, tổ chức thành gui/widgets, interface, models và routes."),
      },
    ],
    stack: [
      { name: "Python + PySide6", evidence: "requirements.txt", repo: "Deplao" },
      { name: "python-socketio", evidence: "requirements.txt", repo: "Deplao" },
      { name: "Node.js + Express", evidence: "backend_chat/package.json", repo: "Deplao" },
      { name: "Socket.IO", evidence: "backend_chat/package.json", repo: "Deplao" },
      { name: "PostgreSQL (pg)", evidence: "backend_chat/package.json", repo: "Deplao" },
      { name: "JWT + bcryptjs + Multer", evidence: "backend_chat/package.json", repo: "Deplao" },
    ],
    caseStudy: {
      overview: {
        en: "A full client–server exercise across two languages. Real-time features beyond what the file layout shows (e.g. presence, read receipts) are described as \"coming soon\" in the README and are not claimed here.",
        ja: d("二つの言語にまたがるクライアント／サーバーの実践的な題材です。ファイル構成から確認できる範囲を超える機能（オンライン状態や既読など）は README で「今後対応」とされており、ここでは主張していません。"),
        vi: d("Một bài thực hành client–server trọn vẹn trên hai ngôn ngữ. Các tính năng thời gian thực vượt quá những gì cấu trúc tệp cho thấy (như trạng thái online, đã đọc) được README ghi là \"sắp có\" và không được khẳng định ở đây."),
      },
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export type { LocalizedText };
