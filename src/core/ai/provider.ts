/** Provider-independent language-model interface. Nothing outside this folder knows which vendor is behind it. */
export interface GenerateRequest { system: string; user: string; maxTokens: number; signal?: AbortSignal }
export interface GenerateResult { text: string; usage: { inputTokens: number; outputTokens: number } }
export interface LanguageModel { id: string; generate(req: GenerateRequest): Promise<GenerateResult> }
export class ModelUnavailable extends Error {}
