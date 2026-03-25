/**
 * Utility for humanizing AI text and splitting it into natural WhatsApp-style messages.
 */

export interface HumanizerSettings {
  tone?: string;
  responseStyle?: string;
  useEmojis?: boolean;
}

/**
 * Strips formal "AI-isms" that make bots feel robotic.
 */
export function antiRobotFilter(text: string): string {
  let filtered = text;

  const patterns = [
    /how can i assist you today\??/gi,
    /as an ai assistant/gi,
    /dear customer/gi,
    /i am here to help you/gi,
    /i apologize for the inconvenience/gi,
    /under no circumstances/gi,
    /thank you for reaching out/gi,
    /sincerely,/gi,
    /best regards/gi,
  ];

  for (const pattern of patterns) {
    filtered = filtered.replace(pattern, '');
  }

  // Cleanup whitespace
  return filtered.trim();
}

/**
 * Humanizes phrasing, simplifies sentences, and adds/removes emojis.
 */
export function humanizeText(text: string, settings: HumanizerSettings): string {
  let processed = text;

  // 1. Simplify formal phrases
  const simplifications: Record<string, string> = {
    'i am': 'i\'m',
    'we are': 'we\'re',
    'do not': 'don\'t',
    'cannot': 'can\'t',
    'it is': 'it\'s',
    'you are': 'you\'re',
    'please': '', // Remove polite padding in casual mode if excessive
    'certainly': 'sure',
    'absolutely': 'yeah',
    'greatly appreciated': 'thanks',
    'looking forward to': 'can\'t wait to',
  };

  if (settings.tone === 'casual' || settings.tone === 'friendly') {
    for (const [formal, casual] of Object.entries(simplifications)) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      processed = processed.replace(regex, casual);
    }
  }

  // 2. Emoji Injection (if enabled and missing)
  if (settings.useEmojis && !/[\u{1F300}-\u{1F9FF}]/u.test(processed)) {
    const emojis = ['👍', '👌', '✨', '😊', '✅'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    processed = `${processed} ${randomEmoji}`;
  }

  return processed.trim();
}

/**
 * Splits a long response into an array of short, WhatsApp-style message chunks.
 */
export function splitHumanMessage(text: string): string[] {
  if (!text) return [];

  // Break on major punctuation followed by space
  const chunks = text
    .split(/(?<=[.?!])\s+/)
    .filter(chunk => chunk.trim().length > 0);

  // If a single chunk is still too long (> 150 chars), try to split on commas or 'and'
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length > 150) {
      const subChunks = chunk
        .split(/(?<=,)\s+/)
        .filter(sc => sc.trim().length > 0);
      finalChunks.push(...subChunks);
    } else {
      finalChunks.push(chunk);
    }
  }

  return finalChunks.map(c => c.trim());
}
