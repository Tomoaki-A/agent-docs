import fs from 'fs'
import path from 'path'

export const MARKER_START = '<!-- agent-docs:start -->'
export const MARKER_END = '<!-- agent-docs:end -->'
export const IGNORE = ['.DS_Store', 'settings.local.json']
export const SKIP_IF_EXISTS: string[] = []

export const SKIP_DIRS_IF_EXISTS = [
  path.join('docs', 'projects'),
]

export function mergeClaude(srcPath: string, destPath: string): void {
  const srcContent = fs.readFileSync(srcPath, 'utf8')
  const srcStart = srcContent.indexOf(MARKER_START)
  const srcEnd = srcContent.indexOf(MARKER_END)
  const managedSection = srcContent.slice(srcStart, srcEnd + MARKER_END.length)

  if (!fs.existsSync(destPath)) {
    fs.writeFileSync(destPath, srcContent)
    console.log('copied: CLAUDE.md')
    return
  }

  const destContent = fs.readFileSync(destPath, 'utf8')
  const destStart = destContent.indexOf(MARKER_START)
  const destEnd = destContent.indexOf(MARKER_END)

  if (destStart !== -1 && destEnd !== -1) {
    const before = destContent.slice(0, destStart)
    const after = destContent.slice(destEnd + MARKER_END.length)
    fs.writeFileSync(destPath, before + managedSection + after)
  } else {
    fs.writeFileSync(destPath, managedSection + '\n\n' + destContent)
  }
  console.log('merged: CLAUDE.md')
}

export function copyRecursive(srcDir: string, destDir: string, destRoot: string): void {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    if (IGNORE.includes(entry.name)) continue
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      const relativeDir = path.relative(destRoot, destPath)
      if (SKIP_DIRS_IF_EXISTS.includes(relativeDir) && fs.existsSync(destPath)) {
        console.log(`skip (already exists): ${relativeDir}/`)
        continue
      }
      fs.mkdirSync(destPath, { recursive: true })
      copyRecursive(srcPath, destPath, destRoot)
    } else {
      const relative = path.relative(destRoot, destPath)
      if (SKIP_IF_EXISTS.includes(relative) && fs.existsSync(destPath)) {
        console.log(`skip (already exists): ${relative}`)
        continue
      }
      fs.copyFileSync(srcPath, destPath)
      console.log(`copied: ${relative}`)
    }
  }
}

export function run(src: string, dest: string): void {
  for (const target of ['docs', '.claude', 'CLAUDE.md']) {
    const srcPath = path.join(src, target)
    const destPath = path.join(dest, target)
    const stat = fs.statSync(srcPath)
    if (stat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      copyRecursive(srcPath, destPath, dest)
    } else if (target === 'CLAUDE.md') {
      mergeClaude(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
      console.log(`copied: ${target}`)
    }
  }
}

if (require.main === module) {
  run(path.join(__dirname, '..'), process.cwd())
}
