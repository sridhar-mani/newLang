import type { SourceLocation } from './ast';
/**
 * Source map position
 */
export interface SourcePosition {
    line: number;
    column: number;
}
/**
 * Source mapping entry
 */
export interface SourceMapping {
    generated: SourcePosition;
    original: SourcePosition;
    source: string;
    name?: string;
}
/**
 * Source map V3 format
 */
export interface SourceMapV3 {
    version: 3;
    file: string;
    sourceRoot?: string;
    sources: string[];
    sourcesContent?: (string | null)[];
    names: string[];
    mappings: string;
}
/**
 * Source Map Generator
 */
export declare class SourceMapGenerator {
    private mappings;
    private sources;
    private sourcesContent;
    private names;
    private file;
    constructor(file: string);
    /**
     * Add a source file
     */
    addSource(source: string, content?: string): number;
    /**
     * Add a name
     */
    addName(name: string): number;
    /**
     * Add a mapping
     */
    addMapping(mapping: SourceMapping): void;
    /**
     * Add a mapping from source location
     */
    addLocationMapping(generatedLine: number, generatedColumn: number, originalLocation: SourceLocation, name?: string): void;
    /**
     * Generate source map JSON
     */
    generate(): SourceMapV3;
    /**
     * Generate source map as JSON string
     */
    toString(): string;
    /**
     * Generate source map as data URL
     */
    toDataURL(): string;
    /**
     * Generate source map comment for appending to output
     */
    toComment(): string;
    private encodeMappings;
}
/**
 * Create source map generator for a transpilation
 */
export declare function createSourceMapGenerator(outputFile: string): SourceMapGenerator;
/**
 * Merge multiple source maps (for chained transformations)
 */
export declare function mergeSourceMaps(maps: SourceMapV3[]): SourceMapV3;
/**
 * Add source map to generated code
 */
export declare function appendSourceMap(code: string, sourceMap: SourceMapV3): string;
//# sourceMappingURL=source-maps.d.ts.map