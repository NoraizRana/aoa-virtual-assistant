/**
 * preprocessor.js
 * Cleans user input: lowercase, remove punctuation,
 * remove stopwords, basic stemming
 */

const STOPWORDS = new Set([
  "a", "an", "the", "is", "it", "in", "on", "at", "to", "for",
  "of", "and", "or", "but", "not", "with", "this", "that", "what",
  "how", "why", "when", "where", "which", "who", "me", "my", "i",
  "do", "does", "did", "can", "could", "please", "tell", "explain",
  "describe", "give", "show", "about", "are", "was", "were", "be",
  "been", "being", "have", "has", "had", "will", "would", "should",
  "shall", "may", "might", "must", "than", "then", "so", "if",
  "its", "your", "you", "we", "they", "he", "she", "their",
]);

// Very basic suffix stemmer
const stem = (word) => {
  if (word.endsWith("ing") && word.length > 5) return word.slice(0, -3);
  if (word.endsWith("tion") && word.length > 6) return word.slice(0, -4);
  if (word.endsWith("ed") && word.length > 4)  return word.slice(0, -2);
  if (word.endsWith("ly") && word.length > 4)  return word.slice(0, -2);
  if (word.endsWith("es") && word.length > 4)  return word.slice(0, -2);
  if (word.endsWith("er") && word.length > 4)  return word.slice(0, -2);
  return word;
};

const preprocess = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")   // remove punctuation
    .split(/\s+/)                    // split into words
    .filter((w) => w.length > 1)    // remove single chars
    .filter((w) => !STOPWORDS.has(w)) // remove stopwords
    .map(stem)                       // stem each word
    .join(" ");
};

// Returns array of tokens
const tokenize = (text) => {
  return preprocess(text).split(/\s+/).filter(Boolean);
};

module.exports = { preprocess, tokenize };