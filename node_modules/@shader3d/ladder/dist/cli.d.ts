#!/usr/bin/env node
/**
 * Init command - create new project
 */
declare function initCommand(args: string[]): Promise<void>;
/**
 * Upgrade command - suggest next level
 */
declare function upgradeCommand(): Promise<void>;
/**
 * Build command - compile shaders
 */
declare function buildCommand(): Promise<void>;
/**
 * Watch command - watch and rebuild
 */
declare function watchCommand(): Promise<void>;
/**
 * Main entry point
 */
declare function main(): Promise<void>;
export { main, initCommand, upgradeCommand, buildCommand, watchCommand };
//# sourceMappingURL=cli.d.ts.map