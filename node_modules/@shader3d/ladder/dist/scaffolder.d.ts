import type { SkillLevel } from './detector';
/**
 * Project template types
 */
export type ProjectTemplate = 'minimal' | 'vite-vanilla' | 'vite-react' | 'vite-vue' | 'threejs' | 'particles' | 'raymarching';
/**
 * Scaffold options
 */
export interface ScaffoldOptions {
    name: string;
    template: ProjectTemplate;
    level: SkillLevel;
    typescript?: boolean;
    installDeps?: boolean;
    git?: boolean;
}
/**
 * File to generate
 */
interface GeneratedFile {
    path: string;
    content: string;
}
/**
 * Project Scaffolder
 */
export declare class ProjectScaffolder {
    /**
     * Generate project files
     */
    scaffold(options: ScaffoldOptions): GeneratedFile[];
    /**
     * Write files to disk
     */
    write(targetDir: string, files: GeneratedFile[]): Promise<void>;
    private generatePackageJson;
    private generateMinimalTemplate;
    private generateViteVanillaTemplate;
    private generateViteReactTemplate;
    private generateParticlesTemplate;
    private generateRaymarchingTemplate;
    private getShaderExample;
    private getReactShaderComponent;
    private generateTsConfig;
    private generateGitignore;
    private generateReadme;
}
/**
 * Create project scaffolder
 */
export declare function createScaffolder(): ProjectScaffolder;
/**
 * Scaffold a new project
 */
export declare function scaffoldProject(options: ScaffoldOptions): GeneratedFile[];
export {};
//# sourceMappingURL=scaffolder.d.ts.map