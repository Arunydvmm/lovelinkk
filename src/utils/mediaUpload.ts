// Shared helpers for turning a raw <input type="file"> selection into a
// validated, compressed, reliably-uploaded Cloudinary asset.

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_AUDIO_SIZE_MB = 20;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" isn't a supported image type. Please use JPG, PNG, or WEBP.`;
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return null;
}

export function validateAudioFile(file: File): string | null {
  if (!file.type.startsWith('audio/')) {
    return `"${file.name}" isn't a supported audio type.`;
  }
  if (file.size > MAX_AUDIO_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${MAX_AUDIO_SIZE_MB}MB.`;
  }
  return null;
}

/**
 * Downscales and re-compresses an image client-side before it ever leaves the
 * browser — keeps uploads fast and payloads small without a visible quality hit.
 * Falls back to the original file if canvas compression fails for any reason.
 */
export function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension && file.size < 1.5 * 1024 * 1024) {
        // Already small enough — skip compression entirely.
        resolve(file);
        return;
      }

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
          resolve(compressed.size < file.size ? compressed : file);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // couldn't decode for compression — upload the original
    };

    img.src = objectUrl;
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = () => reject(new Error('Could not read the file. Please try again.'));
    reader.readAsDataURL(file);
  });
}

function isLikelyNetworkError(err: any): boolean {
  // fetch() rejects with a generic TypeError for network failures (offline, DNS, CORS) —
  // as opposed to an Error we threw ourselves for a valid HTTP error response.
  return err instanceof TypeError || /network|fetch/i.test(err?.message || '');
}

/**
 * Retries a transient (network-level) failure with short backoff. Does NOT retry
 * on real server errors (bad file, auth failure, etc.) — those won't fix themselves.
 */
export async function withUploadRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (!isLikelyNetworkError(err) || i === attempts - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}
