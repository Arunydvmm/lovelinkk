// Shared helpers for turning a raw <input type="file"> selection into a
// validated, compressed, reliably-uploaded Cloudinary asset.
//
// FIXES in this version:
//  - HEIC / HEIF (iPhone) photos are accepted (server converts them to JPG).
//  - Files with an empty/unknown MIME type (some Android pickers) are detected by extension.
//  - Data URLs always carry a correct MIME prefix (Cloudinary rejects "application/octet-stream").
//  - Transparent PNGs no longer turn black when re-encoded (white background is painted first).
//  - Retry now also covers 408/429/5xx gateway errors and timeouts, not only TypeError.
//  - runWithUploadLimit() keeps max 3 uploads in flight so picking 20 photos doesn't choke.

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_AUDIO_SIZE_MB = 20;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/** Use these on <input type="file" accept=...> so the picker offers the right files. */
export const IMAGE_INPUT_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif';
export const AUDIO_INPUT_ACCEPT = 'audio/*,.mp3,.m4a,.wav,.ogg,.aac';

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
};

function extOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name || '');
  return m ? m[1].toLowerCase() : '';
}

/** Best-effort MIME type: trusts file.type, falls back to the file extension. */
export function getFileMime(file: File): string {
  const t = (file.type || '').toLowerCase();
  if (t && t !== 'application/octet-stream') {
    return t === 'image/jpg' ? 'image/jpeg' : t;
  }
  return EXT_TO_MIME[extOf(file.name)] || '';
}

export function isHeic(file: File): boolean {
  const mime = getFileMime(file);
  return mime === 'image/heic' || mime === 'image/heif';
}

export function validateImageFile(file: File): string | null {
  const mime = getFileMime(file);
  if (!ACCEPTED_IMAGE_TYPES.includes(mime)) {
    return `"${file.name}" isn't a supported image type. Please use JPG, PNG, WEBP or HEIC.`;
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return null;
}

export function validateAudioFile(file: File): string | null {
  const mime = getFileMime(file);
  if (!mime.startsWith('audio/')) {
    return `"${file.name}" isn't a supported audio type. Please use MP3, M4A, WAV, OGG or AAC.`;
  }
  if (file.size > MAX_AUDIO_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${MAX_AUDIO_SIZE_MB}MB.`;
  }
  return null;
}

/**
 * Downscales and re-compresses an image client-side before it ever leaves the
 * browser — keeps uploads fast and payloads small without a visible quality hit.
 * Falls back to the original file if canvas compression fails for any reason
 * (e.g. Chrome can't decode HEIC — the server converts those instead).
 */
export function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    const heic = isHeic(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (!heic && width <= maxDimension && height <= maxDimension && file.size < 1.5 * 1024 * 1024) {
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

      // JPEG has no alpha channel — paint white first so transparent PNGs don't turn black.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = (file.name || 'photo').replace(/\.[^.]+$/, '');
          const compressed = new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          // For HEIC we always prefer the decoded JPEG (browsers can't display HEIC).
          resolve(heic || compressed.size < file.size ? compressed : file);
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

/**
 * Reads a file as a base64 data URL. Guarantees a valid MIME prefix, because some
 * pickers give an empty file.type and the browser then emits "data:application/octet-stream".
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      let result = event.target?.result as string;
      const mime = getFileMime(file);
      if (mime && /^data:(application\/octet-stream)?;base64,/.test(result)) {
        result = result.replace(/^data:(application\/octet-stream)?;base64,/, `data:${mime};base64,`);
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Could not read the file. Please try again.'));
    reader.readAsDataURL(file);
  });
}

function isRetryableError(err: any): boolean {
  const msg = String(err?.message || '');
  // fetch() rejects with a generic TypeError for network failures (offline, DNS, CORS) —
  // as opposed to an Error we threw ourselves for a valid HTTP error response.
  if (err instanceof TypeError) return true;
  return /network|failed to fetch|timeout|timed out|ETIMEDOUT|ECONNRESET|socket hang up|HTTP error (408|429|500|502|503|504)/i.test(msg);
}

/**
 * Retries a transient failure with short backoff. Does NOT retry on real client
 * errors (bad file, auth failure, etc.) — those won't fix themselves.
 */
export async function withUploadRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (!isRetryableError(err) || i === attempts - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  throw lastErr;
}

// ─── Upload concurrency limiter ─────────────────────────────────────────────
// Picking 20 photos at once used to fire 20 parallel 2MB base64 POSTs, which
// stalls on mobile networks and trips proxy limits. This keeps a small window open.

let activeUploads = 0;
const uploadWaiters: Array<() => void> = [];

export async function runWithUploadLimit<T>(fn: () => Promise<T>, max = 3): Promise<T> {
  while (activeUploads >= max) {
    await new Promise<void>((resolve) => uploadWaiters.push(resolve));
  }
  activeUploads++;
  try {
    return await fn();
  } finally {
    activeUploads--;
    uploadWaiters.shift()?.();
  }
}
