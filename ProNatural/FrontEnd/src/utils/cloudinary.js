export function getCloudinaryUrl(publicId, options = 'f_auto,q_auto,w_800') {
  if (!publicId) {
    return 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=800&auto=format&fit=crop';
  }
  if (publicId.startsWith('http://') || publicId.startsWith('https://') || publicId.startsWith('data:')) {
    return publicId;
  }
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'pronatural';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${options}/${publicId}`;
}
