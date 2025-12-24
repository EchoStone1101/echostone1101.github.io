import { joinSegments, QUARTZ, FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import fs from "fs"
import path from "path"

interface RootFilesOptions {
  files: string[]
}

export const RootFiles: QuartzEmitterPlugin<RootFilesOptions> = (opts) => ({
  name: "RootFiles",
  async *emit({ argv }) {
    const files = opts?.files ?? []
    
    for (const filename of files) {
      const sourcePath = joinSegments(QUARTZ, "static", filename)
      
      try {
        const content = await fs.promises.readFile(sourcePath, "utf-8")
        const ext = path.extname(filename)
        const basename = path.basename(filename, ext)
        
        yield write({
          ctx: { argv } as BuildCtx,
          slug: basename as FullSlug,
          ext: (ext ? ext : "") as `.${string}` | "",
          content,
        })
      } catch (err) {
        console.warn(`Warning: ${filename} not found at ${sourcePath}`)
      }
    }
  },
  async *partialEmit() {},
})

