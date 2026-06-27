#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.copyRecursive = exports.mergeClaude = exports.SKIP_DIRS_IF_EXISTS = exports.SKIP_IF_EXISTS = exports.IGNORE = exports.MARKER_END = exports.MARKER_START = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/** マネージドセクションの開始マーカー */
exports.MARKER_START = '<!-- agent-docs:start -->';
/** マネージドセクションの終了マーカー */
exports.MARKER_END = '<!-- agent-docs:end -->';
/** コピー対象から除外するファイル名のリスト */
exports.IGNORE = ['.DS_Store', 'settings.local.json'];
/** コピー先に既に存在する場合にスキップするファイルの相対パスリスト */
exports.SKIP_IF_EXISTS = [];
/** コピー先に既に存在する場合にスキップするディレクトリの相対パスリスト */
exports.SKIP_DIRS_IF_EXISTS = [
    path_1.default.join('docs', 'projects'),
];
/**
 * src の CLAUDE.md のマネージドセクションを dest の CLAUDE.md にマージする
 */
const mergeClaude = ({ srcPath, destPath }) => {
    const srcContent = fs_1.default.readFileSync(srcPath, 'utf8');
    const srcStart = srcContent.indexOf(exports.MARKER_START);
    const srcEnd = srcContent.indexOf(exports.MARKER_END);
    const managedSection = srcContent.slice(srcStart, srcEnd + exports.MARKER_END.length);
    if (!fs_1.default.existsSync(destPath)) {
        fs_1.default.writeFileSync(destPath, srcContent);
        return 'copied: CLAUDE.md';
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
    return 'merged: CLAUDE.md';
};
exports.mergeClaude = mergeClaude;
/**
 * srcDir 配下のファイル・ディレクトリを destDir へ再帰的にコピーする
 */
const copyRecursive = ({ srcDir, destDir, destRoot }) => {
    return Array.from(fs_1.default.readdirSync(srcDir, { withFileTypes: true }))
        .filter(entry => !exports.IGNORE.includes(entry.name))
        .flatMap(entry => {
        const srcPath = path_1.default.join(srcDir, entry.name);
        const destPath = path_1.default.join(destDir, entry.name);
        if (entry.isDirectory()) {
            const relativeDir = path_1.default.relative(destRoot, destPath);
            if (exports.SKIP_DIRS_IF_EXISTS.includes(relativeDir) && fs_1.default.existsSync(destPath)) {
                return [`skip (already exists): ${relativeDir}/`];
            }
            fs_1.default.mkdirSync(destPath, { recursive: true });
            return (0, exports.copyRecursive)({ srcDir: srcPath, destDir: destPath, destRoot });
        }
        else {
            const relative = path_1.default.relative(destRoot, destPath);
            if (exports.SKIP_IF_EXISTS.includes(relative) && fs_1.default.existsSync(destPath)) {
                return [`skip (already exists): ${relative}`];
            }
            fs_1.default.copyFileSync(srcPath, destPath);
            return [`copied: ${relative}`];
        }
    });
};
exports.copyRecursive = copyRecursive;
/**
 * src ディレクトリから dest ディレクトリへ docs / .claude / CLAUDE.md を同期する
 */
const run = ({ src, dest }) => {
    return ['docs', '.claude', 'CLAUDE.md'].flatMap(target => {
        const srcPath = path_1.default.join(src, target);
        const destPath = path_1.default.join(dest, target);
        const stat = fs_1.default.statSync(srcPath);
        if (stat.isDirectory()) {
            fs_1.default.mkdirSync(destPath, { recursive: true });
            return (0, exports.copyRecursive)({ srcDir: srcPath, destDir: destPath, destRoot: dest });
        }
        else if (target === 'CLAUDE.md') {
            return [(0, exports.mergeClaude)({ srcPath, destPath })];
        }
        else {
            fs_1.default.copyFileSync(srcPath, destPath);
            return [`copied: ${target}`];
        }
    });
};
exports.run = run;
if (require.main === module) {
    const messages = (0, exports.run)({ src: path_1.default.join(__dirname, '..'), dest: process.cwd() });
    console.log(messages.join('\n'));
}
