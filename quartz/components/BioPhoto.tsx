import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { joinSegments, pathToRoot } from "../util/path"

interface BioPhotoOptions {
  imagePath?: string
  alt?: string
}

const defaultOptions: BioPhotoOptions = {
  imagePath: "static/bio-photo.jpg",
  alt: "Bio photo",
}

export default ((opts?: Partial<BioPhotoOptions>) => {
  const options: BioPhotoOptions = { ...defaultOptions, ...opts }

  function BioPhoto({ fileData, displayClass }: QuartzComponentProps) {
    const baseDir = pathToRoot(fileData.slug!)
    const imageSrc = joinSegments(baseDir, options.imagePath!)

    return (
      <div class={classNames(displayClass, "bio-photo-container")}>
        <img src={imageSrc} alt={options.alt} class="bio-photo" />
      </div>
    )
  }

  BioPhoto.css = `
.bio-photo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.bio-photo {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
`

  return BioPhoto
}) satisfies QuartzComponentConstructor

