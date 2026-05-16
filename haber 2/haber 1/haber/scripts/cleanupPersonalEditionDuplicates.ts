import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const applyChanges = process.argv.includes('--apply')

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

type CleanupGroupPlan = {
  userId: string
  date: Date
  type: string
  keeper: EditionSummary
  toDelete: EditionSummary[]
}

type CleanupReport = {
  mode: 'dry-run' | 'apply'
  totalEditions: number
  duplicateGroupCount: number
  duplicateEditionCount: number
  cleanedGroupCount: number
  deletedEditionCount: number
  deletedArticleLinkCount: number
  remainingDuplicateGroupCount: number
}

function makeEditionKey(edition: Pick<EditionSummary, 'userId' | 'date' | 'type'>) {
  return `${edition.userId}::${edition.date.toISOString()}::${edition.type}`
}

function sortEditionsForKeeper(left: EditionSummary, right: EditionSummary) {
  const leftReady = left.status === 'READY' ? 1 : 0
  const rightReady = right.status === 'READY' ? 1 : 0

  if (leftReady !== rightReady) {
    return rightReady - leftReady
  }

  if (left.articleCount !== right.articleCount) {
    return right.articleCount - left.articleCount
  }

  if (left.createdAt.getTime() !== right.createdAt.getTime()) {
    return right.createdAt.getTime() - left.createdAt.getTime()
  }

  return left.id.localeCompare(right.id)
}

function formatEdition(edition: EditionSummary) {
  return {
    id: edition.id,
    status: edition.status,
    createdAt: edition.createdAt.toISOString(),
    articleCount: edition.articleCount,
  }
}

async function collectDuplicateGroups(): Promise<{ totalEditions: number; groups: DuplicateGroup[] }> {
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

  const groups = Array.from(grouped.values())
    .filter((group) => group.length > 1)
    .map((group) => ({
      userId: group[0].userId,
      date: group[0].date,
      type: group[0].type,
      editions: [...group].sort(sortEditionsForKeeper),
    }))

  return { totalEditions: editions.length, groups }
}

function buildCleanupPlans(groups: DuplicateGroup[]): CleanupGroupPlan[] {
  return groups.map((group) => {
    const ordered = [...group.editions].sort(sortEditionsForKeeper)
    return {
      userId: group.userId,
      date: group.date,
      type: group.type,
      keeper: ordered[0],
      toDelete: ordered.slice(1),
    }
  })
}

async function main() {
  const initial = await collectDuplicateGroups()
  const plans = buildCleanupPlans(initial.groups)

  const report: CleanupReport = {
    mode: applyChanges ? 'apply' : 'dry-run',
    totalEditions: initial.totalEditions,
    duplicateGroupCount: initial.groups.length,
    duplicateEditionCount: initial.groups.reduce((total, group) => total + group.editions.length, 0),
    cleanedGroupCount: 0,
    deletedEditionCount: 0,
    deletedArticleLinkCount: 0,
    remainingDuplicateGroupCount: initial.groups.length,
  }

  console.log(`Mode: ${report.mode}`)
  console.log(`Total PersonalEdition rows: ${report.totalEditions}`)
  console.log(`Duplicate group count: ${report.duplicateGroupCount}`)

  if (plans.length === 0) {
    console.log('No duplicate PersonalEdition groups found. Nothing to clean.')
    console.log(
      JSON.stringify(
        {
          mode: report.mode,
          cleanedGroupCount: 0,
          deletedEditionCount: 0,
          deletedArticleLinkCount: 0,
          remainingDuplicateGroupCount: 0,
        },
        null,
        2
      )
    )
    return
  }

  for (const [index, plan] of plans.entries()) {
    console.log('')
    console.log(
      `Group ${index + 1}: userId=${plan.userId} date=${plan.date.toISOString()} type=${plan.type}`
    )
    console.log('Keeper:')
    console.table([formatEdition(plan.keeper)])
    console.log('Delete:')
    console.table(plan.toDelete.map(formatEdition))
  }

  if (!applyChanges) {
    console.log('')
    console.log('Run with --apply to modify the database.')
    console.log(
      JSON.stringify(
        {
          mode: report.mode,
          cleanedGroupCount: 0,
          deletedEditionCount: 0,
          deletedArticleLinkCount: 0,
          remainingDuplicateGroupCount: report.remainingDuplicateGroupCount,
        },
        null,
        2
      )
    )
    return
  }

  for (const plan of plans) {
    const editionIdsToDelete = plan.toDelete.map((edition) => edition.id)
    const articleLinkCount = plan.toDelete.reduce((total, edition) => total + edition.articleCount, 0)

    await prisma.$transaction(async (tx) => {
      await tx.personalEditionArticle.deleteMany({
        where: {
          editionId: {
            in: editionIdsToDelete,
          },
        },
      })

      await tx.personalEdition.deleteMany({
        where: {
          id: {
            in: editionIdsToDelete,
          },
        },
      })
    })

    report.cleanedGroupCount += 1
    report.deletedEditionCount += editionIdsToDelete.length
    report.deletedArticleLinkCount += articleLinkCount
  }

  const remaining = await collectDuplicateGroups()
  report.remainingDuplicateGroupCount = remaining.groups.length

  console.log('')
  console.log(
    JSON.stringify(
      {
        mode: report.mode,
        cleanedGroupCount: report.cleanedGroupCount,
        deletedEditionCount: report.deletedEditionCount,
        deletedArticleLinkCount: report.deletedArticleLinkCount,
        remainingDuplicateGroupCount: report.remainingDuplicateGroupCount,
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
