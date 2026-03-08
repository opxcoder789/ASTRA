#!/usr/bin/env node
/**
 * ASTRA Frontend Cleanup Script
 * Removes unused code, dead files, and optimizes the frontend bundle.
 * 
 * Run: node scripts/cleanup.mjs
 * Dry run: node scripts/cleanup.mjs --dry-run
 */

import { readFileSync, unlinkSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');
const isDryRun = process.argv.includes('--dry-run');

console.log('\n🧹 ASTRA Frontend Cleanup Script');
console.log('================================\n');

if (isDryRun) {
    console.log('🔍 DRY RUN — no files will be deleted\n');
}

// 1. Find all .tsx/.ts files in src/
function getAllFiles(dir, ext = ['.tsx', '.ts']) {
    const results = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            results.push(...getAllFiles(full, ext));
        } else if (ext.some(e => full.endsWith(e))) {
            results.push(full);
        }
    }
    return results;
}

// 2. Find which files are actually imported
function findImportsIn(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
        const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
        const imports = new Set();

        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.add(match[1]);
        }
        while ((match = dynamicImportRegex.exec(content)) !== null) {
            imports.add(match[1]);
        }
        return imports;
    } catch {
        return new Set();
    }
}

// 3. Build dependency graph
const allFiles = getAllFiles(SRC);
const allImports = new Set();

for (const file of allFiles) {
    const imports = findImportsIn(file);
    for (const imp of imports) {
        // Resolve relative imports
        if (imp.startsWith('.')) {
            const dir = join(file, '..');
            const resolved = resolve(dir, imp);
            // Try with extensions
            for (const ext of ['.tsx', '.ts', '.js', '/index.tsx', '/index.ts']) {
                allImports.add(resolved + ext);
            }
            allImports.add(resolved);
        }
    }
}

// 4. Check which files are never imported (dead code)
console.log('📁 Checking for unused files...\n');
const unusedFiles = [];
const entryPoints = [
    join(SRC, 'main.tsx'),
    join(SRC, 'App.tsx'),
    join(SRC, 'vite-env.d.ts'),
];

for (const file of allFiles) {
    if (entryPoints.includes(file)) continue;

    const isImported = Array.from(allImports).some(imp => {
        const normalized = file.replace(/\\/g, '/');
        const impNormalized = imp.replace(/\\/g, '/');
        return normalized === impNormalized || normalized.startsWith(impNormalized);
    });

    if (!isImported) {
        unusedFiles.push(file);
    }
}

if (unusedFiles.length > 0) {
    console.log('❌ Unused files found (not imported anywhere):\n');
    for (const file of unusedFiles) {
        const rel = relative(ROOT, file);
        const size = statSync(file).size;
        console.log(`   ${rel} (${(size / 1024).toFixed(1)} KB)`);

        if (!isDryRun) {
            unlinkSync(file);
            console.log(`   ✅ Deleted`);
        }
    }
} else {
    console.log('✅ No unused files found!\n');
}

// 5. Check for console.log statements (performance)
console.log('\n📝 Checking for console.log statements...\n');
let consoleLogCount = 0;

for (const file of allFiles) {
    if (!existsSync(file)) continue;
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
        if (line.includes('console.log(') && !line.trim().startsWith('//')) {
            const rel = relative(ROOT, file);
            console.log(`   ${rel}:${i + 1} — ${line.trim().substring(0, 80)}`);
            consoleLogCount++;
        }
    });
}

if (consoleLogCount > 0) {
    console.log(`\n   ⚠️  Found ${consoleLogCount} console.log statement(s) — consider removing for production\n`);
} else {
    console.log('   ✅ No console.log statements found\n');
}

// 6. Check for large inline styles or duplicate class strings
console.log('📊 Bundle Size Analysis:\n');

let totalSize = 0;
const fileSizes = [];

for (const file of allFiles) {
    if (!existsSync(file)) continue;
    const size = statSync(file).size;
    totalSize += size;
    fileSizes.push({ file: relative(ROOT, file), size });
}

fileSizes.sort((a, b) => b.size - a.size);

console.log('   Top 5 largest source files:');
for (const { file, size } of fileSizes.slice(0, 5)) {
    const kb = (size / 1024).toFixed(1);
    const bar = '█'.repeat(Math.ceil(size / 2048));
    console.log(`   ${bar} ${file} (${kb} KB)`);
}

console.log(`\n   Total source size: ${(totalSize / 1024).toFixed(1)} KB`);

// 7. Summary
console.log('\n================================');
console.log('📋 Summary:');
console.log(`   Total files scanned: ${allFiles.length}`);
console.log(`   Unused files: ${unusedFiles.length}`);
console.log(`   Console.log statements: ${consoleLogCount}`);
console.log(`   Total source size: ${(totalSize / 1024).toFixed(1)} KB`);

if (isDryRun && unusedFiles.length > 0) {
    console.log(`\n💡 Run without --dry-run to delete unused files`);
}

console.log('\n✨ Cleanup complete!\n');
