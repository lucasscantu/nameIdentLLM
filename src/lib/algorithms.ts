// Levenshtein Distance Algorithm
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

export function levenshteinSimilarity(s1: string, s2: string): number {
  if (s1.length === 0 && s2.length === 0) return 100;
  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

// Jaro-Winkler Algorithm
function jaroSimilarity(s1: string, s2: string): number {
  if (s1.length === 0 && s2.length === 0) return 1;
  
  const matchDistance = Math.max(Math.floor(Math.max(s1.length, s2.length) / 2) - 1, 0);
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, s2.length);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0;
  
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  return (
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3
  );
}

export function jaroWinklerSimilarity(s1: string, s2: string): number {
  const jaro = jaroSimilarity(s1, s2);
  const prefix = Math.min(Math.min(s1.length, s2.length), 4);
  
  let prefixLength = 0;
  for (let i = 0; i < prefix; i++) {
    if (s1[i] === s2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }
  
  const winkler = jaro + prefixLength * 0.1 * (1 - jaro);
  return Math.round(winkler * 100);
}

// Token-based Similarity
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sàáâãéêíóôõúüç]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);
}

export function tokenBasedSimilarity(s1: string, s2: string): number {
  const tokens1 = new Set(tokenize(s1));
  const tokens2 = new Set(tokenize(s2));
  
  if (tokens1.size === 0 && tokens2.size === 0) return 100;
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  
  const jaccard = intersection.size / union.size;
  return Math.round(jaccard * 100);
}

// Bigram Similarity
export function getBigrams(text: string): string[] {
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, '');
  const bigrams: string[] = [];
  
  for (let i = 0; i < normalized.length - 1; i++) {
    bigrams.push(normalized.substring(i, i + 2));
  }
  
  return bigrams;
}

export function bigramSimilarity(s1: string, s2: string): number {
  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);
  
  if (bigrams1.length === 0 && bigrams2.length === 0) return 100;
  if (bigrams1.length === 0 || bigrams2.length === 0) return 0;
  
  const set1 = new Set(bigrams1);
  const set2 = new Set(bigrams2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const dice = (2 * intersection.size) / (set1.size + set2.size);
  return Math.round(dice * 100);
}

// Combined Similarity Score
export function combinedSimilarity(s1: string, s2: string): {
  levenshtein: number;
  jaroWinkler: number;
  tokenBased: number;
  bigram: number;
  combined: number;
} {
  const lev = levenshteinSimilarity(s1, s2);
  const jw = jaroWinklerSimilarity(s1, s2);
  const tb = tokenBasedSimilarity(s1, s2);
  const bg = bigramSimilarity(s1, s2);
  
  // Weighted average: token-based and bigram get higher weights for academic texts
  const combined = Math.round(lev * 0.2 + jw * 0.2 + tb * 0.3 + bg * 0.3);
  
  return { levenshtein: lev, jaroWinkler: jw, tokenBased: tb, bigram: bg, combined };
}

// Find similar passages between two texts
export function findSimilarPassages(text1: string, text2: string, windowSize: number = 50): {
  text1: string;
  text2: string;
  similarity: number;
  position1: number;
  position2: number;
}[] {
  const passages: {
    text1: string;
    text2: string;
    similarity: number;
    position1: number;
    position2: number;
  }[] = [];
  
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  for (let i = 0; i < words1.length; i += Math.floor(windowSize / 2)) {
    const passage1 = words1.slice(i, i + windowSize).join(' ');
    
    let bestMatch = { similarity: 0, text2: '', position2: 0 };
    
    for (let j = 0; j < words2.length; j += Math.floor(windowSize / 2)) {
      const passage2 = words2.slice(j, j + windowSize).join(' ');
      const sim = bigramSimilarity(passage1, passage2);
      
      if (sim > bestMatch.similarity) {
        bestMatch = { similarity: sim, text2: passage2, position2: j };
      }
    }
    
    if (bestMatch.similarity > 40) {
      passages.push({
        text1: passage1,
        text2: bestMatch.text2,
        similarity: bestMatch.similarity,
        position1: i,
        position2: bestMatch.position2,
      });
    }
  }
  
  return passages.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
}
