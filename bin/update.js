#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKIP_IF_EXISTS = exports.IGNORE = exports.MARKER_END = exports.MARKER_START = void 0;
exports.mergeClaude = mergeClaude;
exports.copyRecursive = copyRecursive;
exports.run = run;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.MARKER_START = '<!-- agent-docs:start -->';
exports.MARKER_END = '<!-- agent-docs:end -->';
exports.IGNORE = ['.DS_Store', 'settings.local.json'];
exports.SKIP_IF_EXISTS = [
    path_1.default.join('docs', 'rules', 'projects.md'),
];
function mergeClaude(srcPath, destPath) {
    const srcContent = fs_1.default.readFileSync(srcPath, 'utf8');
    const srcStart = srcContent.indexOf(exports.MARKER_START);
    const srcEnd = srcContent.indexOf(exports.MARKER_END);
    const managedSection = srcContent.slice(srcStart, srcEnd + exports.MARKER_END.length);
    if (!fs_1.default.existsSync(destPath)) {
        fs_1.default.writeFileSync(destPath, srcContent);
        console.log('copied: CLAUDE.md');
        return;
    }
    const destContent = fs_1.default.readFileSync(destPath, 'utf8');
    const destStart = destContent.indexOf(exports.MARKER_START);
    const destEnd = destContent.indexOf(exports.MARKER_END);
    if (destStart !== -1 && destEnd !== -1) {
        const before = destContent.slice(0, destStart);
        const after = destContent.slice(destEnd + exports.MARKER_END.length);
        fs_1.default.writeFileSync(destPath, before + managedSection + after);
    }
    else {
        fs_1.default.writeFileSync(destPath, managedSection + '\n\n' + destContent);
    }
    console.log('merged: CLAUDE.md');
}
function copyRecursive(srcDir, destDir, destRoot) {
    const entries = fs_1.default.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        if (exports.IGNORE.includes(entry.name))
            continue;
        const srcPath = path_1.default.join(srcDir, entry.name);
        const destPath = path_1.default.join(destDir, entry.name);
        if (entry.isDirectory()) {
            fs_1.default.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath, destRoot);
        }
        else {
            const relative = path_1.default.relative(destRoot, destPath);
            if (exports.SKIP_IF_EXISTS.includes(relative) && fs_1.default.existsSync(destPath)) {
                console.log(`skip (already exists): ${relative}`);
                continue;
            }
            fs_1.default.copyFileSync(srcPath, destPath);
            console.log(`copied: ${relative}`);
        }
    }
}
function run(src, dest) {
    for (const target of ['docs', '.claude', 'CLAUDE.md']) {
        const srcPath = path_1.default.join(src, target);
        const destPath = path_1.default.join(dest, target);
        const stat = fs_1.default.statSync(srcPath);
        if (stat.isDirectory()) {
            fs_1.default.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath, dest);
        }
        else if (target === 'CLAUDE.md') {
            mergeClaude(srcPath, destPath);
        }
        else {
            fs_1.default.copyFileSync(srcPath, destPath);
            console.log(`copied: ${target}`);
        }
    }
}
if (require.main === module) {
    run(path_1.default.join(__dirname, '..'), process.cwd());
}
