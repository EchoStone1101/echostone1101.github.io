import { joinSegments, QUARTZ, FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import fs from "fs"

export const RobotsTxt: QuartzEmitterPlugin = () => ({
  name: "RobotsTxt",
  async *emit({ argv }) {
    const robotsTxtPath = joinSegments(QUARTZ, "static", "robots.txt")
    
    // Check if robots.txt exists in static folder
    try {
      const content = await fs.promises.readFile(robotsTxtPath, "utf-8")
      
      yield write({
        ctx: { argv } as BuildCtx,
        slug: "robots" as FullSlug,
        ext: ".txt",
        content,
      })
    } catch (err) {
      // Silently skip if robots.txt doesn't exist
      console.warn(`Warning: robots.txt not found at ${robotsTxtPath}`)
    }
  },
  async *partialEmit() {},
})

