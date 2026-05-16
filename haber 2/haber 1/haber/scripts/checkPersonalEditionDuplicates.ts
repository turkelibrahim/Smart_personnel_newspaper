import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type EditionSummary = {
  id: string
  userId: string
  date: Date
  type: string
  status: string
  createdAt: Date
  articleCount: number
}

type DuplicateGroup = {
  userId: string
  date: Date
  type: string
  editions: EditionSummary[]
}

type DuplicateReport = {
  totalEditions: number
  duplicateGroupCount: number
  duplicateEditionCount: number
  safeForUniqueMigration: boolean
  duplicateGroups: DuplicateGroup[]
}

function makeEditionKey(edition: Pick<EditionSummary, 'userId' | 'date' | 'type'>) {
  return `${edition.userId}::${edition.date.toISOString()}::${edition.type}`
}

function formatEdition(edition: EditionSummary) {
  return {
    id: edition.id,
    status: edition.status,
    createdAt: edition.createdAt.toISOString(),
    articleCount: edition.articleCount,
  }
}

async function collectDuplicateReport(): Promise<DuplicateReport> {
  const editions = await prisma.personalEdition.findMany({
    select: {
      id: true,
      userId: true,
      date: true,
      type: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
    orderBy: [{ date: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
  })

  const grouped = new Map<string, EditionSummary[]>()

  for (const edition of editions) {
    const summary: EditionSummary = {
      id: edition.id,
      userId: edition.userId,
      date: edition.date,
      type: edition.type,
      status: edition.status,
      createdAt: edition.createdAt,
      articleCount: edition._count.articles,
    }

    const key = makeEditionKey(summary)
    const existing = grouped.get(key) ?? []
    existing.push(summary)
    grouped.set(key, existing)
  }

  const duplicateGroups: DuplicateGroup[] = Array.from(grouped.values())
    .filter((group) => group.length > 1)
    .map((group) => ({
      userId: group[0].userId,
      date: group[0].date,
      type: group[0].type,
      editions: [...group].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime()),
    }))

  return {
    totalEditions: editions.length,
    duplicateGroupCount: duplicateGroups.length,
    duplicateEditionCount: duplicateGroups.reduce((total, group) => total + group.editions.length, 0),
    safeForUniqueMigration: duplicateGroups.length === 0,
    duplicateGroups,
  }
}

async function main() {
  const report = await collectDuplicateReport()

  console.log(`Total PersonalEdition rows: ${report.totalEditions}`)
  console.log(`Duplicate group count: ${report.duplicateGroupCount}`)
  console.log(`Duplicate edition count: ${report.duplicateEditionCount}`)

  if (report.duplicateGroups.length === 0) {
    console.log('No duplicate PersonalEdition groups found.')
    console.log('Safe for unique migration: true')
  } else {
    console.log('Safe for unique migration: false')

    for (const [index, group] of report.duplicateGroups.entries()) {
      console.log('')
      console.log(
        `Group ${index + 1}: userId=${group.userId} date=${group.date.toISOString()} type=${group.type}`
      )
      console.table(group.editions.map(formatEdition))
    }
  }

  console.log('')
  console.log(
    JSON.stringify(
      {
        totalEditions: report.totalEditions,
        duplicateGroupCount: report.duplicateGroupCount,
        duplicateEditionCount: report.duplicateEditionCount,
        safeForUniqueMigration: report.safeForUniqueMigration,
      },
      null,
      2
    )
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
