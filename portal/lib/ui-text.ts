// Remove emoji sequences from presentation copy while preserving numbers,
// Chinese text, punctuation, and ordinary copyright/trademark symbols.
const emojiSequences=/(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}+|[\u00A9\u00AE\u2122]\uFE0F|(?:(?![\u00A9\u00AE\u2122])\p{Extended_Pictographic})(?:\uFE0F|\p{Emoji_Modifier})*(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})*)*[\u{E0020}-\u{E007F}]*|\p{Emoji_Modifier}|\uFE0F)/gu;
export function withoutEmoji(value:string):string{return value.replace(emojiSequences,'').trim();}
