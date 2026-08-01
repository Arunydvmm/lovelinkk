/**
 * JSON Validator for LoveLink TemplateSpec
 * Returns a list of human-readable error strings. Empty array = valid.
 */

const REQUIRED_THEME_KEYS = [
  'background', 'accent', 'headingColor', 'textColor', 'cardBg', 'cardBorder',
  'fontSerif', 'fontSans',
] as const;

const VALID_ANIMATIONS = new Set([
  'fadeUp', 'fadeIn', 'slideLeft', 'slideRight', 'zoomIn', 'none',
]);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTemplateJson(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['Root must be a JSON object.'], warnings };
  }

  const obj = raw as Record<string, unknown>;

  // version
  if (obj.version !== '1') {
    errors.push(`"version" must be "1" (got ${JSON.stringify(obj.version)}).`);
  }

  // name
  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    warnings.push('"name" is missing or empty — a descriptive name is recommended.');
  }

  // theme
  if (!obj.theme || typeof obj.theme !== 'object' || Array.isArray(obj.theme)) {
    errors.push('"theme" must be an object.');
  } else {
    const theme = obj.theme as Record<string, unknown>;
    for (const key of REQUIRED_THEME_KEYS) {
      if (typeof theme[key] !== 'string' || !(theme[key] as string).trim()) {
        errors.push(`theme.${key} is required and must be a non-empty string.`);
      }
    }
  }

  // sections
  if (!Array.isArray(obj.sections)) {
    errors.push('"sections" must be an array.');
  } else if (obj.sections.length === 0) {
    errors.push('"sections" must contain at least one section.');
  } else {
    const validTypes = new Set([
      'hero', 'letter', 'reasons', 'gallery', 'timeline',
      'quotes', 'music', 'certificate', 'countdown', 'ending',
      'video', 'gift-opening',
    ]);
    const seenIds = new Set<string>();
    (obj.sections as unknown[]).forEach((sec, i) => {
      if (!sec || typeof sec !== 'object' || Array.isArray(sec)) {
        errors.push(`sections[${i}] must be an object.`);
        return;
      }
      const s = sec as Record<string, unknown>;

      // id
      if (typeof s.id !== 'string' || !s.id.trim()) {
        errors.push(`sections[${i}].id is required.`);
      } else if (seenIds.has(s.id as string)) {
        errors.push(`sections[${i}].id "${s.id}" is duplicated.`);
      } else {
        seenIds.add(s.id as string);
      }

      // type
      if (!validTypes.has(s.type as string)) {
        errors.push(
          `sections[${i}].type "${s.type}" is not recognised. Valid types: ${[...validTypes].join(', ')}.`
        );
      }

      // animation (optional but if present must be valid)
      if (s.animation !== undefined && !VALID_ANIMATIONS.has(s.animation as string)) {
        warnings.push(
          `sections[${i}].animation "${s.animation}" is not a known preset — will default to "fadeUp".`
        );
      }

      // Warn if hero is not first
      if (s.type === 'hero' && i !== 0) {
        warnings.push('The "hero" section is recommended as the first section.');
      }

      // Warn if ending is not last
      if (s.type === 'ending' && i !== (obj.sections as unknown[]).length - 1) {
        warnings.push('The "ending" section should be the last section.');
      }
    });

    // check for mandatory sections
    const types = (obj.sections as Record<string, unknown>[]).map(s => s.type as string);
    if (!types.includes('hero')) warnings.push('No "hero" section found — the welcome screen will be missing.');
    if (!types.includes('ending')) warnings.push('No "ending" section found — the final surprise screen will be missing.');
  }

  // fields (optional)
  if (obj.fields !== undefined) {
    if (!Array.isArray(obj.fields)) {
      errors.push('"fields" must be an array if provided.');
    } else {
      const validFieldTypes = new Set([
        'text', 'textarea', 'number', 'date', 'time',
        'select', 'radio', 'checkbox', 'gallery', 'image',
        'video', 'audio', 'timeline', 'quote', 'emoji', 'color', 'url',
      ]);
      (obj.fields as unknown[]).forEach((f, i) => {
        if (!f || typeof f !== 'object') {
          errors.push(`fields[${i}] must be an object.`);
          return;
        }
        const field = f as Record<string, unknown>;
        if (typeof field.key !== 'string' || !field.key.trim()) {
          errors.push(`fields[${i}].key is required.`);
        }
        if (!validFieldTypes.has(field.type as string)) {
          errors.push(`fields[${i}].type "${field.type}" is not a valid field type.`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
