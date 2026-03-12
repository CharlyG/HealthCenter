/**
 * Duplicate Patient Detection Service
 * 
 * Prevents duplicate patient admissions using fuzzy matching algorithms
 * 
 * Features:
 * - Name similarity (Levenshtein distance)
 * - Date of birth matching
 * - SSN/MRN matching
 * - Phonetic matching (Soundex)
 * - Configurable thresholds
 * - Merge workflow support
 */

export interface PatientIdentifier {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // YYYY-MM-DD format
  ssn?: string; // Last 4 digits
  mrn?: string;
  address?: string;
  phone?: string;
}

export interface DuplicateMatch {
  patient: PatientIdentifier;
  matchScore: number; // 0-100
  matchReasons: string[];
  matchType: 'exact' | 'high' | 'medium' | 'low';
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matches: DuplicateMatch[];
  confidence: 'high' | 'medium' | 'low';
  requiresReview: boolean;
}

class DuplicateDetectionServiceClass {
  // Threshold configuration
  private readonly EXACT_MATCH_THRESHOLD = 95;
  private readonly HIGH_MATCH_THRESHOLD = 85;
  private readonly MEDIUM_MATCH_THRESHOLD = 70;
  private readonly LOW_MATCH_THRESHOLD = 60;

  /**
   * Check if a patient is a potential duplicate
   */
  async checkForDuplicates(
    patient: Omit<PatientIdentifier, 'id'>,
    existingPatients: PatientIdentifier[]
  ): Promise<DuplicateCheckResult> {
    const matches: DuplicateMatch[] = [];

    for (const existingPatient of existingPatients) {
      const matchScore = this.calculateMatchScore(patient, existingPatient);
      
      if (matchScore >= this.LOW_MATCH_THRESHOLD) {
        const matchReasons = this.getMatchReasons(patient, existingPatient);
        const matchType = this.getMatchType(matchScore);

        matches.push({
          patient: existingPatient,
          matchScore,
          matchReasons,
          matchType
        });
      }
    }

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    const isDuplicate = matches.length > 0 && matches[0].matchScore >= this.HIGH_MATCH_THRESHOLD;
    const confidence = this.getConfidence(matches);
    const requiresReview = matches.length > 0;

    return {
      isDuplicate,
      matches,
      confidence,
      requiresReview
    };
  }

  /**
   * Calculate overall match score (0-100)
   */
  private calculateMatchScore(
    patient1: Omit<PatientIdentifier, 'id'>,
    patient2: PatientIdentifier
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Name matching (weight: 30)
    const nameScore = this.calculateNameSimilarity(patient1, patient2);
    totalScore += nameScore * 30;
    totalWeight += 30;

    // Date of Birth matching (weight: 40)
    const dobScore = this.calculateDOBSimilarity(patient1.dateOfBirth, patient2.dateOfBirth);
    totalScore += dobScore * 40;
    totalWeight += 40;

    // SSN matching (weight: 20, if available)
    if (patient1.ssn && patient2.ssn) {
      const ssnScore = patient1.ssn === patient2.ssn ? 100 : 0;
      totalScore += ssnScore * 20;
      totalWeight += 20;
    }

    // MRN matching (weight: 10, if available)
    if (patient1.mrn && patient2.mrn) {
      const mrnScore = patient1.mrn === patient2.mrn ? 100 : 0;
      totalScore += mrnScore * 10;
      totalWeight += 10;
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Calculate name similarity using multiple algorithms
   */
  private calculateNameSimilarity(
    patient1: Omit<PatientIdentifier, 'id'>,
    patient2: PatientIdentifier
  ): number {
    const firstName1 = this.normalize(patient1.firstName);
    const firstName2 = this.normalize(patient2.firstName);
    const lastName1 = this.normalize(patient1.lastName);
    const lastName2 = this.normalize(patient2.lastName);

    // Exact match
    if (firstName1 === firstName2 && lastName1 === lastName2) {
      return 100;
    }

    // Calculate Levenshtein similarity
    const firstNameSimilarity = this.levenshteinSimilarity(firstName1, firstName2);
    const lastNameSimilarity = this.levenshteinSimilarity(lastName1, lastName2);

    // Check phonetic similarity (Soundex)
    const firstNamePhonetic = this.soundex(firstName1) === this.soundex(firstName2) ? 1 : 0;
    const lastNamePhonetic = this.soundex(lastName1) === this.soundex(lastName2) ? 1 : 0;

    // Weighted combination
    const nameSimilarity = (
      (lastNameSimilarity * 0.5) + 
      (firstNameSimilarity * 0.3) +
      (lastNamePhonetic * 0.1) +
      (firstNamePhonetic * 0.1)
    ) * 100;

    return Math.round(nameSimilarity);
  }

  /**
   * Calculate Date of Birth similarity
   */
  private calculateDOBSimilarity(dob1: string, dob2: string): number {
    if (dob1 === dob2) return 100;

    // Parse dates
    const date1 = new Date(dob1);
    const date2 = new Date(dob2);

    // Check if dates are valid
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return 0;
    }

    // Check if year matches (common data entry error: wrong day/month)
    if (date1.getFullYear() === date2.getFullYear()) {
      // Check if month matches
      if (date1.getMonth() === date2.getMonth()) {
        return 80; // Same year and month, different day
      }
      return 60; // Same year, different month
    }

    // Check for transposed digits in year (e.g., 1945 vs 1954)
    const year1 = date1.getFullYear().toString();
    const year2 = date2.getFullYear().toString();
    if (this.areTransposed(year1, year2)) {
      return 40;
    }

    return 0;
  }

  /**
   * Get human-readable match reasons
   */
  private getMatchReasons(
    patient1: Omit<PatientIdentifier, 'id'>,
    patient2: PatientIdentifier
  ): string[] {
    const reasons: string[] = [];

    const firstName1 = this.normalize(patient1.firstName);
    const firstName2 = this.normalize(patient2.firstName);
    const lastName1 = this.normalize(patient1.lastName);
    const lastName2 = this.normalize(patient2.lastName);

    // Check name matches
    if (firstName1 === firstName2 && lastName1 === lastName2) {
      reasons.push('Exact name match');
    } else if (this.levenshteinSimilarity(firstName1, firstName2) > 0.8 &&
               this.levenshteinSimilarity(lastName1, lastName2) > 0.8) {
      reasons.push('Very similar name');
    } else if (this.soundex(firstName1) === this.soundex(firstName2) &&
               this.soundex(lastName1) === this.soundex(lastName2)) {
      reasons.push('Phonetically similar name');
    }

    // Check DOB
    if (patient1.dateOfBirth === patient2.dateOfBirth) {
      reasons.push('Same date of birth');
    } else if (this.calculateDOBSimilarity(patient1.dateOfBirth, patient2.dateOfBirth) >= 60) {
      reasons.push('Similar date of birth');
    }

    // Check SSN
    if (patient1.ssn && patient2.ssn && patient1.ssn === patient2.ssn) {
      reasons.push('Same SSN');
    }

    // Check MRN
    if (patient1.mrn && patient2.mrn && patient1.mrn === patient2.mrn) {
      reasons.push('Same MRN');
    }

    return reasons;
  }

  /**
   * Determine match type based on score
   */
  private getMatchType(score: number): 'exact' | 'high' | 'medium' | 'low' {
    if (score >= this.EXACT_MATCH_THRESHOLD) return 'exact';
    if (score >= this.HIGH_MATCH_THRESHOLD) return 'high';
    if (score >= this.MEDIUM_MATCH_THRESHOLD) return 'medium';
    return 'low';
  }

  /**
   * Determine confidence level
   */
  private getConfidence(matches: DuplicateMatch[]): 'high' | 'medium' | 'low' {
    if (matches.length === 0) return 'low';
    
    const topScore = matches[0].matchScore;
    if (topScore >= this.EXACT_MATCH_THRESHOLD) return 'high';
    if (topScore >= this.HIGH_MATCH_THRESHOLD) return 'medium';
    return 'low';
  }

  /**
   * Normalize string for comparison
   */
  private normalize(str: string): string {
    return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Calculate Levenshtein similarity (0-1)
   */
  private levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 1;
    
    return 1 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,      // deletion
            dp[i][j - 1] + 1,      // insertion
            dp[i - 1][j - 1] + 1   // substitution
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Soundex phonetic algorithm
   */
  private soundex(str: string): string {
    const normalized = str.toUpperCase().replace(/[^A-Z]/g, '');
    if (normalized.length === 0) return '0000';

    const first = normalized[0];
    const codes: Record<string, string> = {
      'B': '1', 'F': '1', 'P': '1', 'V': '1',
      'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
      'D': '3', 'T': '3',
      'L': '4',
      'M': '5', 'N': '5',
      'R': '6'
    };

    let result = first;
    let prev = codes[first] || '0';

    for (let i = 1; i < normalized.length && result.length < 4; i++) {
      const code = codes[normalized[i]] || '0';
      if (code !== '0' && code !== prev) {
        result += code;
      }
      if (code !== '0') {
        prev = code;
      }
    }

    return result.padEnd(4, '0');
  }

  /**
   * Check if two strings are transposed versions
   */
  private areTransposed(str1: string, str2: string): boolean {
    if (str1.length !== str2.length) return false;
    
    let differences = 0;
    for (let i = 0; i < str1.length; i++) {
      if (str1[i] !== str2[i]) differences++;
    }
    
    // Allow 2 transposed digits
    return differences === 2;
  }
}

export const DuplicateDetectionService = new DuplicateDetectionServiceClass();
