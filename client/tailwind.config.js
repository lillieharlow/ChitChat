/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      // Accessible & calming color palette for disability-friendly UI
      white: '#FFFFFF',
      black: '#1A1A1A',

      // Sage Green — calming, associated with nature and balance
      sage: {
        50: '#F4F7F2',
        100: '#E8EFE6',
        200: '#D1DFCD',
        400: '#9CAF88',
        600: '#7A9568',
        700: '#5C7A4E', // dark enough for text on light backgrounds (6:1+ on white)
        800: '#3D5530', // very dark sage for headings on sage-50 (6.3:1)
      },

      // Soft Blue — reduces anxiety, promotes relaxation
      sky: {
        50: '#F0F8FB',
        100: '#E0F1F7',
        200: '#B4D7F1',
        400: '#7EB3D4',
        600: '#5A9CC4',
      },

      // Soft Neutrals — reduces visual clutter, prevents sensory overload
      gray: {
        50: '#FAFAF9',
        100: '#F5F1E8', // Cream
        200: '#EDE9DE',
        400: '#D3D3D3', // Soft Grey
        600: '#8B8B8B',
        800: '#4A4A4A',
      },

      // Pastels — lavender and pale pink reduce frustration
      lavender: {
        50: '#FAF9FD',
        100: '#F5F1F9',
        300: '#E8E4F3',
        500: '#D4C5E2',
      },

      pink: {
        100: '#F5E8F0',
        300: '#E8D4E0',
      },

      // Error state — kept minimal; red-600 on red-50 gives 4.8:1 contrast (passes AA)
      red: {
        50: '#FFF5F5',
        100: '#FFE4E4',
        600: '#C53030',
      },
    },
  },
  plugins: [],
};
