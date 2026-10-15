declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    GEMINI_API_KEY?: string;
    GEMINI_MODEL?: string;
    AI_PROVIDER?: string;
    AI_DAILY_LIMIT?: string;
    BUCKET?: R2Bucket;
  }
}
