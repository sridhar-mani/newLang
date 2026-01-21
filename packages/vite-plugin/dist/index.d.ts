import type { Plugin } from 'vite';
/**
 * Plugin options
 */
export interface Shader3DPluginOptions {
    /** File extensions to process */
    extensions?: string[];
    /** Enable Hot Module Replacement */
    hmr?: boolean;
    /** Show error overlay in browser */
    overlay?: boolean;
    /** Process magic comments in .js/.ts files */
    magicComments?: boolean;
    /** Show performance hints */
    performanceHints?: boolean;
    /** Enable strict mode for all files */
    strict?: boolean;
    /** Include GLSL output for WebGL fallback */
    glslFallback?: boolean;
    /** Custom include patterns */
    include?: string | RegExp | (string | RegExp)[];
    /** Custom exclude patterns */
    exclude?: string | RegExp | (string | RegExp)[];
}
/**
 * Create Shader3D Vite plugin
 */
export default function shader3DPlugin(options?: Shader3DPluginOptions): Plugin;
//# sourceMappingURL=index.d.ts.map