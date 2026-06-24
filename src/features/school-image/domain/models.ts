export type DecodedImage = {
  buffer: Buffer
  contentType: string
  extension: string
}

export type SchoolImageView = {
  imageUrl: string | null
  focalX: number
  focalY: number
}
