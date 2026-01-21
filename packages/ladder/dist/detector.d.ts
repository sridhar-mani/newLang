export type SkillLevel = 0 | 1 | 2 | 3;
export interface SkillLevelInfo {
    level: SkillLevel;
    name: string;
    description: string;
    features: string[];
}
export declare const SKILL_LEVELS: Record<SkillLevel, SkillLevelInfo>;
/**
 * Detection result
 */
export interface DetectionResult {
    level: SkillLevel;
    confidence: number;
    indicators: string[];
    suggestions: string[];
}
/**
 * Detect skill level from source code
 */
export declare class SkillLevelDetector {
    /**
     * Analyze source code and detect skill level
     */
    detect(source: string, filename: string): DetectionResult;
    /**
     * Generate suggestions for upgrading
     */
    private generateSuggestions;
    /**
     * Get recommended next level
     */
    getNextLevel(currentLevel: SkillLevel): SkillLevel | null;
    /**
     * Get learning path from current to target level
     */
    getLearningPath(from: SkillLevel, to: SkillLevel): SkillLevelInfo[];
}
/**
 * Detect skill level from source
 */
export declare function detectSkillLevel(source: string, filename: string): DetectionResult;
/**
 * Get skill level info
 */
export declare function getSkillLevelInfo(level: SkillLevel): SkillLevelInfo;
/**
 * Check if source can be upgraded
 */
export declare function canUpgrade(source: string, filename: string): boolean;
//# sourceMappingURL=detector.d.ts.map