"use server"

import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { addDays } from "date-fns"
import { revalidatePath } from "next/cache"

export async function updateItemStatus(
  itemId: string,
  status: "COMPLETED" | "SKIPPED" | "DEFERRED"
) {
  const user = await getUser()

  const item = await db.roadmapItem.findFirst({
    where: { id: itemId, roadmap: { userId: user.id } },
  })
  if (!item) throw new Error("Item not found")

  if (status === "DEFERRED") {
    await db.roadmapItem.update({
      where: { id: itemId },
      data: {
        scheduledDate: item.scheduledDate
          ? addDays(item.scheduledDate, 1)
          : addDays(new Date(), 1),
        status: "TODO",
      },
    })
  } else {
    await db.roadmapItem.update({
      where: { id: itemId },
      data: { status },
    })
  }

  revalidatePath("/today")
}

export async function startSession(itemId: string): Promise<string> {
  const user = await getUser()

  const item = await db.roadmapItem.findFirst({
    where: { id: itemId, roadmap: { userId: user.id } },
  })
  if (!item) throw new Error("Item not found")

  await db.roadmapItem.update({
    where: { id: itemId },
    data: { status: "IN_PROGRESS" },
  })

  const session = await db.studySession.create({
    data: {
      userId: user.id,
      roadmapItemId: itemId,
    },
  })

  revalidatePath("/today")
  return session.id
}
