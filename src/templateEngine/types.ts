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

  // ── Optional style tokens (all have defaults that reproduce the classic look) ──
  /** Corner style for cards & buttons */
  radius?: 'sharp' | 'soft' | 'round';
  /** Button shape — overrides `radius` for buttons only */
  buttonShape?: 'pill' | 'rounded' | 'square';
  /** CSS box-shadow for cards, e.g. "0 10px 40px rgba(0,0,0,0.4)" */
  cardShadow?: string;
  /** Heading look */
  headingStyle?: 'normal' | 'uppercase' | 'italic';
  /** CSS background of the full-screen overlay above the page background */
  overlay?: string;
  /** Background of the floating music pill & progress bar (use a dark value on dark themes) */
  chromeBg?: string;
  /** Google Fonts stylesheet URL (https://fonts.googleapis.com/...) to load custom fonts */
  fontUrl?: string;
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
  /** Overrides the label of the section's "next" button (e.g. "Read my letter 💌") */
  nextLabel?: string;
  /** Overrides the small pill above the heading. Supports {partnerName} {creatorName} {nickname} */
  badge?: string;
  /** Overrides the section heading. Supports {partnerName} {creatorName} {nickname} */
  title?: string;
  /** Optional small line under the heading */
  subtitle?: string;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  showProfilePicture?: boolean;
  showParticles?: boolean;
  buttonLabel?: string;
  subtitleField?: string; // userData key for subtitle
  /** circle = round photo (default) · banner = wide photo on top · minimal = text only */
  layout?: 'circle' | 'banner' | 'minimal';
}

export interface LetterSection extends BaseSection {
  type: 'letter';
  showSignature?: boolean;
  /** card = default · paper = ruled notepaper · minimal = no box, accent bar */
  style?: 'card' | 'paper' | 'minimal';
  /** e.g. "Hey {nickname}," */
  greeting?: string;
  /** e.g. "Forever yours," */
  closing?: string;
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
  /** grid columns (grid layout only, 1-3) */
  columns?: number;
}

export interface TimelineSection extends BaseSection {
  type: 'timeline';
  showPhotos?: boolean;
  /** line = vertical line (default) · cards = stacked cards */
  layout?: 'line' | 'cards';
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
  /** Overrides the final message. Supports {partnerName} {creatorName} {nickname} */
  message?: string;
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
