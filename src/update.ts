import fs from 'fs'
import path from 'path'

/** マネージドセクションの開始マーカー */
export const MARKER_START = '<!-- agent-docs:start -->'

/** マネージドセクションの終了マーカー */
export const MARKER_END = '<!-- agent-docs:end -->'

/** コピー対象から除外するファイル名のリスト */
export const IGNORE = ['.DS_Store', 'settings.local.json']

/** コピー先に既に存在する場合にスキップするファイルの相対パスリスト */
export const SKIP_IF_EXISTS: Array<string> = []

/** コピー先に既に存在する場合にスキップするディレクトリの相対パスリスト */
export const SKIP_DIRS_IF_EXISTS = [
  path.join('docs', 'projects'),
]

/**
 * src の CLAUDE.md のマネージドセクションを dest の CLAUDE.md にマージする
 */
export const mergeClaude = ({ srcPath, destPath }: { srcPath: string; destPath: string }): string => {
  const srcContent = fs.readFileSync(srcPath, 'utf8')
  const srcStart = srcContent.indexOf(MARKER_START)
  const srcEnd = srcContent.indexOf(MARKER_END)
  const managedSection = srcContent.slice(srcStart, srcEnd + MARKER_END.length)

  if (!fs.existsSync(destPath)) {
    fs.writeFileSync(destPath, srcContent)
    return 'copied: CLAUDE.md'
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
  return 'merged: CLAUDE.md'
}

/**
 * srcDir 配下のファイル・ディレクトリを destDir へ再帰的にコピーする
 */
export const copyRecursive = ({ srcDir, destDir, destRoot }: { srcDir: string; destDir: string; destRoot: string }): Array<string> => {
  return Array.from(fs.readdirSync(srcDir, { withFileTypes: true }))
    .filter(entry => !IGNORE.includes(entry.name))
    .flatMap(entry => {
      const srcPath = path.join(srcDir, entry.name)
      const destPath = path.join(destDir, entry.name)
      if (entry.isDirectory()) {
        const relativeDir = path.relative(destRoot, destPath)
        if (SKIP_DIRS_IF_EXISTS.includes(relativeDir) && fs.existsSync(destPath)) {
          return [`skip (already exists): ${relativeDir}/`]
        }
        fs.mkdirSync(destPath, { recursive: true })
        return copyRecursive({ srcDir: srcPath, destDir: destPath, destRoot })
      } else {
        const relative = path.relative(destRoot, destPath)
        if (SKIP_IF_EXISTS.includes(relative) && fs.existsSync(destPath)) {
          return [`skip (already exists): ${relative}`]
        }
        fs.copyFileSync(srcPath, destPath)
        return [`copied: ${relative}`]
      }
    })
}

/**
 * src ディレクトリから dest ディレクトリへ docs / .claude / CLAUDE.md を同期する
 */
export const run = ({ src, dest }: { src: string; dest: string }): Array<string> => {
  return ['docs', '.claude', 'CLAUDE.md'].flatMap(target => {
    const srcPath = path.join(src, target)
    const destPath = path.join(dest, target)
    const stat = fs.statSync(srcPath)
    if (stat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      return copyRecursive({ srcDir: srcPath, destDir: destPath, destRoot: dest })
    } else if (target === 'CLAUDE.md') {
      return [mergeClaude({ srcPath, destPath })]
    } else {
      fs.copyFileSync(srcPath, destPath)
      return [`copied: ${target}`]
    }
  })
}

if (require.main === module) {
  const messages = run({ src: path.join(__dirname, '..'), dest: process.cwd() })
  console.log(messages.join('\n'))
}
