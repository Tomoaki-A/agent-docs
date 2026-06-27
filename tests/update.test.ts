import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { mergeClaude, copyRecursive, MARKER_START, MARKER_END, IGNORE, SKIP_DIRS_IF_EXISTS } from '../src/update'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-docs-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true })
})

describe('mergeClaude', () => {
  const managed = `${MARKER_START}\n## Rules\n- rule1\n${MARKER_END}`

  it('creates new file when destination does not exist', () => {
    const srcPath = path.join(tmpDir, 'src.md')
    const destPath = path.join(tmpDir, 'CLAUDE.md')
    fs.writeFileSync(srcPath, managed)

    mergeClaude({ srcPath, destPath })

    expect(fs.readFileSync(destPath, 'utf8')).toBe(managed)
  })

  it('replaces managed section when markers exist, preserving user content', () => {
    const srcPath = path.join(tmpDir, 'src.md')
    const destPath = path.join(tmpDir, 'CLAUDE.md')
    const newManaged = `${MARKER_START}\n## Updated Rules\n- new rule\n${MARKER_END}`
    fs.writeFileSync(srcPath, newManaged)
    fs.writeFileSync(destPath, `${MARKER_START}\n## Old Rules\n${MARKER_END}\n\n## User Section\n- custom\n`)

    mergeClaude({ srcPath, destPath })

    const result = fs.readFileSync(destPath, 'utf8')
    expect(result).toContain('## Updated Rules')
    expect(result).not.toContain('## Old Rules')
    expect(result).toContain('## User Section')
  })

  it('prepends managed section when no markers exist, preserving existing content', () => {
    const srcPath = path.join(tmpDir, 'src.md')
    const destPath = path.join(tmpDir, 'CLAUDE.md')
    fs.writeFileSync(srcPath, managed)
    fs.writeFileSync(destPath, '## Existing Content\n- something\n')

    mergeClaude({ srcPath, destPath })

    const result = fs.readFileSync(destPath, 'utf8')
    expect(result.startsWith(MARKER_START)).toBe(true)
    expect(result).toContain('## Existing Content')
    expect(result.indexOf(MARKER_START)).toBeLessThan(result.indexOf('## Existing Content'))
  })
})

describe('copyRecursive', () => {
  it('copies files recursively', () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    fs.mkdirSync(path.join(srcDir, 'sub'), { recursive: true })
    fs.writeFileSync(path.join(srcDir, 'file.md'), 'content')
    fs.writeFileSync(path.join(srcDir, 'sub', 'nested.md'), 'nested')
    fs.mkdirSync(destDir)

    copyRecursive({ srcDir, destDir, destRoot: destDir })

    expect(fs.existsSync(path.join(destDir, 'file.md'))).toBe(true)
    expect(fs.existsSync(path.join(destDir, 'sub', 'nested.md'))).toBe(true)
  })

  it('ignores files in IGNORE list', () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    fs.mkdirSync(srcDir)
    fs.mkdirSync(destDir)
    fs.writeFileSync(path.join(srcDir, '.DS_Store'), '')
    fs.writeFileSync(path.join(srcDir, 'keep.md'), 'content')

    copyRecursive({ srcDir, destDir, destRoot: destDir })

    expect(fs.existsSync(path.join(destDir, '.DS_Store'))).toBe(false)
    expect(fs.existsSync(path.join(destDir, 'keep.md'))).toBe(true)
  })

  it('skips files under SKIP_DIRS_IF_EXISTS directory when the directory already exists at destination', () => {
    const skipDir = SKIP_DIRS_IF_EXISTS[0]
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    const srcFile = path.join(srcDir, skipDir, 'overview.md')
    const destFile = path.join(destDir, skipDir, 'overview.md')

    fs.mkdirSync(path.join(srcDir, skipDir), { recursive: true })
    fs.mkdirSync(path.join(destDir, skipDir), { recursive: true })
    fs.writeFileSync(srcFile, 'new content')
    fs.writeFileSync(destFile, 'user content')

    copyRecursive({ srcDir, destDir, destRoot: destDir })

    expect(fs.readFileSync(destFile, 'utf8')).toBe('user content')
  })

  it('copies files under SKIP_DIRS_IF_EXISTS directory when the directory does not exist at destination', () => {
    const skipDir = SKIP_DIRS_IF_EXISTS[0]
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    const srcFile = path.join(srcDir, skipDir, 'overview.md')
    const destFile = path.join(destDir, skipDir, 'overview.md')

    fs.mkdirSync(path.join(srcDir, skipDir), { recursive: true })
    fs.mkdirSync(destDir)
    fs.writeFileSync(srcFile, 'initial content')

    copyRecursive({ srcDir, destDir, destRoot: destDir })

    expect(fs.readFileSync(destFile, 'utf8')).toBe('initial content')
  })
})
