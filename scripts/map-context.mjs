#!/usr/bin/env node
/** @context JIT Context Assembly mapper. Generates _CONTEXT.md per directory and AI_ROUTER.md at root. */

import { readdir, stat, readFile, writeFile, access } from 'node:fs/promises';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join, relative, extname, basename, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import config from './map-context.config.mjs';

const ROOT = process.cwd();
const isFullMode = process.argv.includes('--full');
const isDryRun = process.argv.includes('--dry-run');
const isQuiet = process.argv.includes('--quiet');

// ─── Utilities ──────────────────────────────────────────────────────

function log(...args) {
    if (!isQuiet) console.log('📍', ...args);
}

function warn(...args) {
    console.warn('⚠️', ...args);
}

async function fileExists(path) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

// ─── Phase 1: Structural Analysis ───────────────────────────────────

/**
 * Get list of changed directories from git staging area.
 * In --full mode, returns all directories.
 */
function getChangedDirectories() {
    if (isFullMode) return null; // null = all directories

    try {
        const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
        const files = output.trim().split('\n').filter(Boolean);
        const dirs = new Set();
        for (const file of files) {
            const dir = dirname(file);
            if (dir !== '.') {
                dirs.add(dir);
                // Also add parent directories
                let parent = dirname(dir);
                while (parent !== '.') {
                    dirs.add(parent);
                    parent = dirname(parent);
                }
            }
        }
        return dirs;
    } catch {
        return null; // If git fails, process all
    }
}

/**
 * Recursively scan a directory and build a structural skeleton.
 */
async function scanDirectory(dirPath, depth = 0) {
    if (depth > config.maxDepth) return null;

    const dirName = basename(dirPath);
    if (config.ignore.includes(dirName)) return null;

    let entries;
    try {
        entries = await readdir(dirPath, { withFileTypes: true });
    } catch {
        return null;
    }

    const files = [];
    const subdirs = [];

    for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.env.example') continue;
        if (entry.name === config.contextFile) continue;

        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
            if (!config.ignore.includes(entry.name)) {
                const subResult = await scanDirectory(fullPath, depth + 1);
                if (subResult) subdirs.push(subResult);
            }
        } else if (entry.isFile()) {
            const ext = extname(entry.name);
            if (config.codeExtensions.includes(ext)) {
                const fileStat = await stat(fullPath);
                const content = fileStat.size <= config.gemini.maxFileSizeBytes
                    ? await readFile(fullPath, 'utf-8')
                    : null;

                files.push({
                    name: entry.name,
                    ext,
                    size: fileStat.size,
                    sizeHuman: formatBytes(fileStat.size),
                    content,
                    imports: content ? extractImports(content) : [],
                });
            }
        }
    }

    if (files.length < config.minFilesForContext && subdirs.length === 0) {
        return null;
    }

    return {
        path: relative(ROOT, dirPath).replace(/\\/g, '/'),
        absolutePath: dirPath,
        name: dirName,
        files,
        subdirs,
        depth,
    };
}

/**
 * Extract import statements from a JS/TS file using regex.
 */
function extractImports(content) {
    const imports = [];
    // ES modules: import ... from '...'
    const esRegex = /import\s+(?:.*?)\s+from\s+['"](.+?)['"]/g;
    let match;
    while ((match = esRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }
    // CommonJS: require('...')
    const cjsRegex = /require\s*\(\s*['"](.+?)['"]\s*\)/g;
    while ((match = cjsRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }
    return imports;
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Phase 2: Gemini CLI Integration ────────────────────────────────

/**
 * Check if Gemini CLI is available.
 */
function isGeminiAvailable() {
    if (!config.gemini.enabled) return false;
    try {
        execSync('gemini --version', { encoding: 'utf-8', stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Generate _CONTEXT.md content using Gemini CLI (Windows-compatible).
 */
async function generateWithGeminiCLI(dirInfo, existingManualSections) {
    const prompt = buildGeminiPrompt(dirInfo, existingManualSections);

    try {
        const tempPromptFile = join(ROOT, '.context-prompt-temp.txt');

        // Write prompt to temp file (sync to ensure it's ready before exec)
        writeFileSync(tempPromptFile, prompt, 'utf-8');

        // Windows-compatible: use PowerShell Get-Content to pipe into gemini
        const result = execSync(
            `powershell -Command "Get-Content -Path '${tempPromptFile.replace(/'/g, "''")}' -Raw | gemini"`,
            {
                encoding: 'utf-8',
                timeout: 60000,
                maxBuffer: 1024 * 1024, // 1MB output buffer
            }
        );

        // Clean up temp file
        try { unlinkSync(tempPromptFile); } catch { }

        return result.trim();
    } catch (e) {
        warn(`Gemini CLI falló para ${dirInfo.path}: ${e.message}`);
        // Clean up temp file on error too
        try { unlinkSync(join(ROOT, '.context-prompt-temp.txt')); } catch { }
        return null;
    }
}

/**
 * Build the prompt for Gemini CLI to generate a _CONTEXT.md.
 */
function buildGeminiPrompt(dirInfo, manualSections) {
    let prompt = `Sos un documentador técnico. Generá un archivo _CONTEXT.md para el directorio \`${dirInfo.path}/\` de un proyecto Next.js de logística internacional.

## Archivos en el directorio
`;

    for (const file of dirInfo.files) {
        prompt += `\n### ${file.name} (${file.sizeHuman})`;
        if (file.imports.length > 0) {
            prompt += `\nImports: ${file.imports.join(', ')}`;
        }
        if (file.content) {
            prompt += `\n\`\`\`${file.ext.replace('.', '')}\n${file.content}\n\`\`\`\n`;
        } else {
            prompt += `\n(archivo demasiado grande para incluir)\n`;
        }
    }

    if (dirInfo.subdirs.length > 0) {
        prompt += `\n## Subdirectorios\n`;
        for (const sub of dirInfo.subdirs) {
            prompt += `- \`${sub.name}/\` — ${sub.files.length} archivos\n`;
        }
    }

    if (manualSections) {
        prompt += `\n## Secciones manuales a preservar (incluir textualmente)\n${manualSections}\n`;
    }

    prompt += `
## Instrucciones
Generá SOLO el contenido markdown con este formato exacto:

# 📁 ${dirInfo.path}

## Propósito
[1-2 oraciones explicando qué hace este módulo/directorio]

## Archivos
| Archivo | Descripción |
|---|---|
[una fila por archivo con descripción funcional breve]

## Relaciones
- **Usa**: [módulos externos que consume, basado en imports]
- **Usado por**: [inferir si es posible, o poner "Por determinar"]

## Detalles clave
[Bullets con lógica de negocio importante, patrones, o consideraciones]

Reglas:
- No incluyas bloques de código en el output
- No inventes archivos que no existen
- Escribí en español
- Sé conciso pero informativo
- Si hay secciones manuales, incluílas al final exactamente como están`;

    return prompt;
}

// ─── Deterministic Fallback ─────────────────────────────────────────

/**
 * Generate _CONTEXT.md content deterministically (no LLM).
 */
function generateDeterministic(dirInfo, manualSections) {
    let content = `# 📁 ${dirInfo.path}\n\n`;
    content += `> Auto-generado por \`scripts/map-context.mjs\` (modo determinístico)\n\n`;
    content += `## Archivos\n`;
    content += `| Archivo | Tamaño | Imports |\n`;
    content += `|---|---|---|\n`;

    for (const file of dirInfo.files) {
        const imports = file.imports.length > 0
            ? file.imports.slice(0, 3).join(', ') + (file.imports.length > 3 ? '...' : '')
            : '—';
        content += `| \`${file.name}\` | ${file.sizeHuman} | ${imports} |\n`;
    }

    if (dirInfo.subdirs.length > 0) {
        content += `\n## Subdirectorios\n`;
        for (const sub of dirInfo.subdirs) {
            content += `- [\`${sub.name}/\`](${sub.name}/_CONTEXT.md) — ${sub.files.length} archivos\n`;
        }
    }

    if (manualSections) {
        content += `\n${manualSections}\n`;
    }

    return content;
}

// ─── Manual Section Preservation ────────────────────────────────────

/**
 * Extract MANUAL sections from existing _CONTEXT.md.
 */
async function extractManualSections(contextFilePath) {
    if (!(await fileExists(contextFilePath))) return null;

    const content = await readFile(contextFilePath, 'utf-8');
    const regex = /<!-- MANUAL:START -->([\s\S]*?)<!-- MANUAL:END -->/g;
    const sections = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        sections.push(`<!-- MANUAL:START -->${match[1]}<!-- MANUAL:END -->`);
    }

    return sections.length > 0 ? sections.join('\n\n') : null;
}

// ─── AI_ROUTER.md Generation ────────────────────────────────────────

/**
 * Generate the root AI_ROUTER.md by aggregating all _CONTEXT.md files.
 */
async function generateRouter(rootDir) {
    const { projectMeta } = config;

    let content = `# 🧭 AI Router — ${projectMeta.name}

> Punto de entrada para agentes IA. Leé este archivo primero.  
> Auto-generado por \`scripts/map-context.mjs\`  
> Última actualización: ${new Date().toISOString().split('T')[0]}

## Proyecto
${projectMeta.description}

## Stack
${projectMeta.stack}

## Convenciones
${projectMeta.conventions.map(c => `- ${c}`).join('\n')}

## Mapa del Proyecto

| Directorio | Archivos | Contexto |
|---|---|---|
`;

    // Collect all directories with _CONTEXT.md
    const contextFiles = await findContextFiles(ROOT);
    for (const cf of contextFiles) {
        const relDir = dirname(relative(ROOT, cf)).replace(/\\/g, '/');
        const fileCount = await countCodeFiles(dirname(cf));
        content += `| \`${relDir}/\` | ${fileCount} | [→ _CONTEXT.md](${relDir}/_CONTEXT.md) |\n`;
    }

    content += `
## Documentación
- [Relevamiento funcional](docs/relevamiento_funcional.md) (si existe)
- [Arquitectura](docs/arquitectura.md) (si existe)
- [Plan de implementación](docs/implementation_plan.md) (si existe)

## Cómo Navegar (para agentes)
1. Leé este archivo para entender el proyecto
2. Identificá qué directorio(s) son relevantes para tu tarea
3. Leé el \`_CONTEXT.md\` de esos directorios  
4. Leé SOLO los archivos específicos que necesitás
5. Ejecutá la tarea con contexto mínimo y preciso
`;

    return content;
}

/**
 * Recursively find all _CONTEXT.md files.
 */
async function findContextFiles(dirPath, depth = 0) {
    if (depth > config.maxDepth) return [];

    const dirName = basename(dirPath);
    if (depth > 0 && config.ignore.includes(dirName)) return [];

    const results = [];
    let entries;
    try {
        entries = await readdir(dirPath, { withFileTypes: true });
    } catch {
        return [];
    }

    for (const entry of entries) {
        if (entry.name === config.contextFile && entry.isFile()) {
            results.push(join(dirPath, entry.name));
        }
        if (entry.isDirectory() && !config.ignore.includes(entry.name) && !entry.name.startsWith('.')) {
            const sub = await findContextFiles(join(dirPath, entry.name), depth + 1);
            results.push(...sub);
        }
    }

    return results;
}

/**
 * Count code files in a directory.
 */
async function countCodeFiles(dirPath) {
    try {
        const entries = await readdir(dirPath, { withFileTypes: true });
        return entries.filter(e =>
            e.isFile() && config.codeExtensions.includes(extname(e.name))
        ).length;
    } catch {
        return 0;
    }
}

// ─── Main Execution ─────────────────────────────────────────────────

async function main() {
    log('🗺️  JIT Context Assembly — Mapper');
    log(`Modo: ${isFullMode ? 'COMPLETO' : 'INCREMENTAL'}`);

    const startTime = Date.now();

    // Phase 1: Scan directory structure
    log('Phase 1: Análisis estructural...');
    const changedDirs = getChangedDirectories();
    const tree = await scanDirectory(ROOT);

    if (!tree) {
        log('No se encontraron archivos de código.');
        return;
    }

    // Collect all directories to process
    const dirsToProcess = collectDirectories(tree);
    const filteredDirs = changedDirs
        ? dirsToProcess.filter(d => changedDirs.has(d.path) || isFullMode)
        : dirsToProcess;

    log(`Directorios a procesar: ${filteredDirs.length}`);

    // Check Gemini CLI availability
    const useGemini = isGeminiAvailable();
    if (useGemini) {
        log('Phase 2: Gemini CLI disponible — generando contexto inteligente');
    } else {
        warn('Gemini CLI no disponible — usando modo determinístico');
    }

    // Process each directory
    let processed = 0;
    for (const dir of filteredDirs) {
        const contextPath = join(dir.absolutePath, config.contextFile);
        const manualSections = await extractManualSections(contextPath);

        let content;
        if (useGemini && !isDryRun) {
            content = await generateWithGeminiCLI(dir, manualSections);
        }

        // Fallback to deterministic if Gemini failed or is not available
        if (!content) {
            content = generateDeterministic(dir, manualSections);
        }

        if (!isDryRun) {
            await writeFile(contextPath, content, 'utf-8');
        }

        processed++;
        log(`  ✅ ${dir.path}/_CONTEXT.md`);
    }

    // Generate AI_ROUTER.md
    log('Generando AI_ROUTER.md...');
    const routerContent = await generateRouter(ROOT);
    if (!isDryRun) {
        await writeFile(join(ROOT, config.routerFile), routerContent, 'utf-8');
    }
    log('  ✅ AI_ROUTER.md');

    const elapsed = Date.now() - startTime;
    log(`\n✨ Completado: ${processed} directorios procesados en ${elapsed}ms`);
}

/**
 * Flatten directory tree into array.
 */
function collectDirectories(node) {
    const result = [];
    if (node.files.length >= config.minFilesForContext) {
        result.push(node);
    }
    for (const sub of node.subdirs) {
        result.push(...collectDirectories(sub));
    }
    return result;
}

main().catch(e => {
    console.error('❌ Mapper error:', e.message);
    process.exit(1);
});
