/**
 * Default built-in template — used for every new surprise unless the user
 * (or admin) selects a different FullTemplate from the gallery.
 *
 * This is the source of truth for the "Classic Romantic" experience.
 * Admin can upload a new JSON from the panel to override it per-template.
 */
import { TemplateSpec } from './types';

export const DEFAULT_TEMPLATE: TemplateSpec = {
  version: '1',
  name: 'Classic Romantic',
  theme: {
    background: 'linear-gradient(135deg, #fce7f3 0%, #fff1f2 40%, #fce7f3 100%)',
    accent: '#f43f5e',
    headingColor: '#4c0519',
    textColor: '#9f1239',
    cardBg: 'rgba(255,255,255,0.92)',
    cardBorder: '#fecdd3',
    fontSerif: "'Playfair Display', Georgia, serif",
    fontSans: "'Plus Jakarta Sans', system-ui, sans-serif",
    particle: '❤️',
    particleCount: 10,
  },
  sections: [
    {
      id: 'hero',
      type: 'hero',
      animation: 'zoomIn',
      showProfilePicture: true,
      showParticles: true,
      buttonLabel: 'Open Our Story',
    },
    {
      id: 'gift-opening',
      type: 'gift-opening',
      animation: 'zoomIn',
    },
    {
      id: 'letter',
      type: 'letter',
      animation: 'slideLeft',
      showSignature: true,
    },
    {
      id: 'reasons',
      type: 'reasons',
      animation: 'fadeIn',
      cardStyle: 'slide',
    },
    {
      id: 'timeline',
      type: 'timeline',
      animation: 'fadeUp',
      showPhotos: true,
    },
    {
      id: 'gallery',
      type: 'gallery',
      animation: 'fadeUp',
      layout: 'grid',
      showCaptions: true,
      showDates: true,
    },
    {
      id: 'quotes',
      type: 'quotes',
      animation: 'fadeUp',
    },
    {
      id: 'music',
      type: 'music',
      animation: 'fadeIn',
      showWaveform: true,
      autoplay: false,
    },
    {
      id: 'certificate',
      type: 'certificate',
      animation: 'zoomIn',
      allowDownload: true,
    },
    {
      id: 'ending',
      type: 'ending',
      animation: 'zoomIn',
      showReplay: true,
      showShare: true,
      showConfetti: true,
    },
  ],
  fields: [
    { key: 'creatorName',    type: 'text',     label: 'Your Name',         required: true },
    { key: 'partnerName',    type: 'text',     label: "Partner's Name",    required: true },
    { key: 'nickname',       type: 'text',     label: 'Nickname / Pet Name' },
    { key: 'relationship',   type: 'select',   label: 'Relationship',
      options: ['Girlfriend','Boyfriend','Wife','Husband','Best Friend','Partner'] },
    { key: 'occasion',       type: 'select',   label: 'Occasion',
      options: ['Anniversary','Birthday',"Valentine's",'Proposal','Friendship','Long Distance','Just Because','Apology'] },
    { key: 'yearsTogether',  type: 'number',   label: 'Years Together' },
    { key: 'specialDate',    type: 'date',     label: 'Special Date' },
    { key: 'coverImage',     type: 'image',    label: 'Cover Photo' },
    { key: 'profilePicture', type: 'image',    label: 'Profile Picture' },
    { key: 'memoryImages',   type: 'gallery',  label: 'Memory Photos',     required: true, max: 20 },
    { key: 'headline',       type: 'text',     label: 'Headline / Tagline' },
    { key: 'welcomeMessage', type: 'text',     label: 'Welcome Message',   required: true },
    { key: 'loveLetter',     type: 'textarea', label: 'Love Letter',       required: true },
    { key: 'letterSignature',type: 'text',     label: 'Signature' },
    { key: 'finalMessage',   type: 'text',     label: 'Final Message' },
    { key: 'reasons',        type: 'textarea', label: 'Reasons (one per line)', max: 15 },
    { key: 'timeline',       type: 'timeline', label: 'Timeline Events' },
    { key: 'quotes',         type: 'quote',    label: 'Quotes & Promises' },
    { key: 'music',          type: 'audio',    label: 'Background Music',  required: true },
    { key: 'countdownDate',  type: 'date',     label: 'Countdown Target Date' },
  ],
};
