const fs = require('fs')
const file = 'bin/update.js'
const content = fs.readFileSync(file, 'utf8')
if (!content.startsWith('#!')) {
  fs.writeFileSync(file, '#!/usr/bin/env node\n' + content)
  fs.chmodSync(file, '755')
}
