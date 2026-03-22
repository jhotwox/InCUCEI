export const createFileObjectFromUrl = (url, type) => {
  if (!url) return null

  return {
    uri: url.startsWith("http")
      ? url
      : `${process.env.EXPO_PUBLIC_SERVER_IP}/${url}`,
    name: `${type}_image.jpg`,
    type: "image/jpeg",
    isUploaded: true,
    uploadedUrl: url,
  }
}