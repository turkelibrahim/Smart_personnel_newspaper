import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

type CandidateReport = {
  label: string
  source: 'cwd' | 'schema'
  resolvedPath: string
  absoluteSqliteUrl: string
  fileExists: boolean
  fileSizeBytes: number | null
  userCount: number | null
  articleCount: number | null
  personalEditionCount: number | null
  hasPersonalEditionUniqueIndex: boolean
  personalEditionIndexes: string[]
  hasPrismaMigrationsTable: boolean
  migrationNames: string[]
  safeRuntimeCandidate: boolean
  error?: string
}

type CliOptions = {
  url?: string
  label?: string
}

const cwd = process.cwd()
const schemaPath = path.resolve(cwd, 'prisma/schema.prisma')
const schemaDir = path.dirname(schemaPath)
const envPath = path.resolve(cwd, '.env')

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {}

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--url') {
      options.url = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--label') {
      options.label = argv[index + 1]
      index += 1
    }
  }

  return options
}

function readDotEnvDatabaseUrl() {
  if (!fs.existsSync(envPath)) return null

  const contents = fs.readFileSync(envPath, 'utf8')
  const match = contents.match(/^DATABASE_URL\s*=\s*("?)(.+?)\1\s*$/m)
  return match?.[2] || null
}

function isAbsoluteFilePath(value: string) {
  return path.isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value)
}

function toAbsoluteSqliteUrl(filePath: string) {
  return `file:${filePath.replace(/\\/g, '/')}`
}

function buildCandidatePaths(databaseUrl: string) {
  if (!databaseUrl.startsWith('file:')) {
    return []
  }

  const rawPath = databaseUrl.slice(5)
  if (!rawPath) return []

  if (isAbsoluteFilePath(rawPath)) {
    const resolvedPath = path.normalize(rawPath)
    return [
      {
        source: 'cwd' as const,
        resolvedPath,
      },
    ]
  }

  return [
    {
      source: 'cwd' as const,
      resolvedPath: path.resolve(cwd, rawPath),
    },
    {
      source: 'schema' as const,
      resolvedPath: path.resolve(schemaDir, rawPath),
    },
  ].filter(
    (candidate, index, all) =>
      all.findIndex((item) => item.resolvedPath.toLowerCase() === candidate.resolvedPath.toLowerCase()) === index
  )
}

async function inspectCandidate(baseLabel: string, source: 'cwd' | 'schema', resolvedPath: string) {
  const fileExists = fs.existsSync(resolvedPath)
  const fileSizeBytes = fileExists ? fs.statSync(resolvedPath).size : null
  const absoluteSqliteUrl = toAbsoluteSqliteUrl(resolvedPath)

  const report: CandidateReport = {
    label: baseLabel,
    source,
    resolvedPath,
    absoluteSqliteUrl,
    fileExists,
    fileSizeBytes,
    userCount: null,
    articleCount: null,
    personalEditionCount: null,
    hasPersonalEditionUniqueIndex: false,
    personalEditionIndexes: [],
    hasPrismaMigrationsTable: false,
    migrationNames: [],
    safeRuntimeCandidate: false,
  }

  if (!fileExists) {
    report.error = 'Database file does not exist.'
    return report
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: absoluteSqliteUrl,
      },
    },
  })

  try {
    report.userCount = await prisma.user.count()
    report.articleCount = await prisma.article.count()
    report.personalEditionCount = await prisma.personalEdition.count()

    const indexes = (await prisma.$queryRawUnsafe(
      `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='PersonalEdition' ORDER BY name`
    )) as Array<{ name: string }>

    report.personalEditionIndexes = indexes.map((index) => index.name)
    report.hasPersonalEditionUniqueIndex = report.personalEditionIndexes.includes(
      'PersonalEdition_userId_date_type_key'
    )

    const migrationTables = (await prisma.$queryRawUnsafe(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations'`
    )) as Array<{ name: string }>

    report.hasPrismaMigrationsTable = migrationTables.length > 0

    if (report.hasPrismaMigrationsTable) {
      const migrations = (await prisma.$queryRawUnsafe(
        `SELECT migration_name FROM _prisma_migrations ORDER BY migration_name`
      )) as Array<{ migration_name: string }>

      report.migrationNames = migrations.map((migration) => migration.migration_name)
    }

    report.safeRuntimeCandidate =
      (report.userCount ?? 0) >= 1 &&
      (report.articleCount ?? 0) >= 1000 &&
      (report.personalEditionCount ?? 0) >= 1 &&
      report.hasPersonalEditionUniqueIndex
  } catch (error) {
    report.error = error instanceof Error ? error.message : String(error)
  } finally {
    await prisma.$disconnect()
  }

  return report
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const dotEnvDatabaseUrl = readDotEnvDatabaseUrl()
  const databaseUrl = args.url || process.env.DATABASE_URL || dotEnvDatabaseUrl

  if (!databaseUrl) {
    throw new Error('DATABASE_URL could not be resolved from arguments, process.env, or .env.')
  }

  const candidates = buildCandidatePaths(databaseUrl)
  const label = args.label || 'default'
  const candidateReports = await Promise.all(
    candidates.map((candidate) => inspectCandidate(label, candidate.source, candidate.resolvedPath))
  )

  const output = {
    processCwd: cwd,
    dotEnvPath: envPath,
    schemaPath,
    schemaDir,
    processEnvDatabaseUrl: process.env.DATABASE_URL || null,
    dotEnvDatabaseUrl,
    prismaDatasourceUrl: 'env(DATABASE_URL)',
    targetUrl: databaseUrl,
    candidateReports,
  }

  console.log(JSON.stringify(output, null, 2))
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
        processCwd: cwd,
        dotEnvPath: envPath,
        schemaPath,
      },
      null,
      2
    )
  )
  process.exit(1)
})
