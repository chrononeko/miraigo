import globby from 'globby'
import { mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { main as jsMain } from 'protobufjs-cli/pbjs'
import { main as tsMain } from 'protobufjs-cli/pbts'

void (async () => {
  await mkdir(resolve(process.cwd(), 'lib'), {
    recursive: true,
  })

  const paths = await globby([
    // 'client/**/*.proto'
    'client/pb/msg/msg.proto',
  ])

  await new Promise((res, rej) =>
    jsMain(
      [
        '-t',
        'json-module',
        '-w',
        'commonjs',
        '--force-number',
        '-r',
        'miraigo',
        '-o',
        'lib/index.js',
        ...paths,
      ],
      (err, out) => (err ? rej(err) : res(out)),
    ),
  )

  await new Promise((res, rej) =>
    jsMain(
      [
        '-t',
        'static-module',
        '-w',
        'commonjs',
        '--force-number',
        '-r',
        'miraigo',
        '-o',
        'lib/static.js',
        ...paths,
      ],
      (err, out) => (err ? rej(err) : res(out)),
    ),
  )

  await new Promise((res, rej) =>
    tsMain(['-o', 'lib/index.d.ts', 'lib/static.js'], (err, out) =>
      err ? rej(err) : res(out),
    ),
  )

  await rm(resolve(process.cwd(), 'lib/static.js'))
})()
