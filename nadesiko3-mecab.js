/**
 * Mecab for なでしこ3プラグイン
 */

// [memo]
// mecab -d <辞書配置ディレクトリー>

const { execSync } = require('child_process')
const path = require("path")
const fs = require('fs')

const PluginMecab = {
  '初期化': {
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__varslist[0]['MECABバージョン'] = '0.0.1'
    }
  },
  
  // @MECAB定数
  'MECABバージョン': {type: 'const', value:'?'}, // @MECABばーじょん
  'MECABオプション': {type: 'const', value: ''}, // @MECABおぷしょん
  'MECABオプション設定': { // @Mecab実行時のオプションを指定する // @MECABおぷしょんせってい
    type: 'func',
    josi: [['で', 'を']],
    fn: function (opt, sys) {
      sys.__v0['MECABオプション'] = opt
    }
  },
  // @MECAB
  'MECAB': { // @Sについて形態素解析を行って結果を二次元配列で返す // @MECAB
    type: 'func',
    josi: [['で', 'を']],
    fn: function (s, sys) {
      const mecabOpt = sys.__v0['MECABオプション']
      const head = 'mecab_' + encodeURIComponent(s.substring(0, 64)) + '.txt'
      const isWin = (process.platform == 'win32')
      const dirTemp = isWin ? process.env['TMP'] : '/tmp'
      const tmpFile = path.join(dirTemp, head)
      fs.writeFileSync(tmpFile, s)
      const params = `mecab ${mecabOpt} "${tmpFile}"`
      const res = execSync(params, {encoding: 'utf8'})
      const result = []
      for (let line of res.split('\n')) {
        if (line === '') { continue }
        const cells = (line + '\t').split('\t')
        const word = cells[0]
        if (word === 'EOS') { continue }
        const args = cells[1].split(',')
        args.unshift(word)
        result.push(args)
      }
      fs.unlinkSync(tmpFile)
      return result
    }
  },
  'MECABヨミガナ取得': { // @Sについてヨミガナを取得する // @MECABよみがなしゅとく
    type: 'func',
    josi: [['の', 'を', 'から']],
    fn: function (s, sys) {
      const mecabResult = sys.__exec('MECAB', [s, sys])
      let res = ''
      for (let a of mecabResult) {
        if (a[8]) {
          res += a[8]
        }
      }
      return res
    }
  }
}

// モジュールのエクスポート(必ず必要)
// scriptタグで取り込んだ時、自動で登録する
if (typeof (navigator) === 'object' && typeof (navigator.nako3) === 'object') {
  navigator.nako3.addPluginObject('PluginMecab', PluginMecab)
} else {
  module.exports = PluginMecab
}

