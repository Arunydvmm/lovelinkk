/**
 * LoveLink Template Engine — Type Definitions
 *
 * A TemplateSpec is stored as `templateJson` in the FullTemplate record.
 * The renderer reads it and turns it into a live page — zero hardcoded logic.
 */

// ─── Theme ────────────────────────────────────────────────────────────────────

export interface TemplateTheme {
  /** CSS background for the page wrapper — any valid CSS value */
  background: string;
  /** Primary accent colour (hex / tailwind arbitrary) */
  accent: string;
  /** Text colour for headings */
  headingColor: string;
  /** Body text colour */
  textColor: string;
  /** Card / panel background */
  cardBg: string;
  /** Card border colour */
  cardBorder: string;
  /** Font family for serif elements */
  fontSerif: string;
  /** Font family for sans elements */
  fontSans: string;
  /** Floating particle element (emoji) */
  particle?: string;
  /** Number of floating particles */
  particleCount?: number;
}

// ─── Field Schema ─────────────────────────────────────────────────────────────

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'date' | 'time'
  | 'select' | 'radio' | 'checkbox'
  | 'gallery' | 'image' | 'video' | 'audio'
  | 'timeline' | 'quote' | 'emoji' | 'color' | 'url';

export interface FieldSchema {
  /** Unique key used to read from userData */
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select / radio
  max?: number;       // for gallery (max images), textarea (max chars)
  defaultValue?: unknown;
}

// ─── Section types ────────────────────────────────────────────────────────────

export type SectionType =
  | 'hero'
  | 'letter'
  | 'reasons'
  | 'gallery'
  | 'timeline'
  | 'quotes'
  | 'music'
  | 'certificate'
  | 'countdown'
  | 'ending'
  | 'video'
  | 'gift-opening';

/** Animation preset applied to a section on mount */
export type AnimationPreset =
  | 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight'
  | 'zoomIn' | 'none';

// ─── Section Definitions ──────────────────────────────────────────────────────

interface BaseSection {
  id: string;
  type: SectionType;
  /** If false, the section is hidden even if data exists */
  enabled?: boolean;
  animation?: AnimationPreset;
  /** Extra CSS classes applied to the section wrapper */
  className?: string;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  showProfilePicture?: boolean;
  showParticles?: boolean;
  buttonLabel?: string;
  subtitleField?: string; // userData key for subtitle
}

export interface LetterSection extends BaseSection {
  type: 'letter';
  showSignature?: boolean;
}

export interface ReasonsSection extends BaseSection {
  type: 'reasons';
  maxVisible?: number;
  cardStyle?: 'flip' | 'slide' | 'fade';
}

export interface GallerySection extends BaseSection {
  type: 'gallery';
  layout?: 'grid' | 'masonry' | 'carousel' | 'polaroid';
  showCaptions?: boolean;
  showDates?: boolean;
  maxPhotos?: number;
}

export interface TimelineSection extends BaseSection {
  type: 'timeline';
  showPhotos?: boolean;
}

export interface QuotesSection extends BaseSection {
  type: 'quotes';
  filter?: ('quote' | 'inside-joke' | 'promise' | 'goal')[];
}

export interface MusicSection extends BaseSection {
  type: 'music';
  showWaveform?: boolean;
  autoplay?: boolean;
}

export interface CertificateSection extends BaseSection {
  type: 'certificate';
  allowDownload?: boolean;
}

export interface CountdownSection extends BaseSection {
  type: 'countdown';
  label?: string;
}

export interface EndingSection extends BaseSection {
  type: 'ending';
  showReplay?: boolean;
  showShare?: boolean;
  showConfetti?: boolean;
}

export interface GiftOpeningSection extends BaseSection {
  type: 'gift-opening';
}

export interface VideoSection extends BaseSection {
  type: 'video';
  /** userData key for video URL */
  urlField?: string;
}

export type TemplateSectionDef =
  | HeroSection | LetterSection | ReasonsSection | GallerySection
  | TimelineSection | QuotesSection | MusicSection | CertificateSection
  | CountdownSection | EndingSection | GiftOpeningSection | VideoSection;

// ─── Root TemplateSpec ────────────────────────────────────────────────────────

export interface TemplateSpec {
  /** Schema version — currently "1" */
  version: '1';
  /** Human readable name (for admin reference) */
  name: string;
  /** Theme tokens */
  theme: TemplateTheme;
  /** Ordered list of sections — renderer iterates this array */
  sections: TemplateSectionDef[];
  /** Field definitions used by the wizard to build the personalization form */
  fields?: FieldSchema[];
}
