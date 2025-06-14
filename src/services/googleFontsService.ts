
interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
}

interface GoogleFontsResponse {
  items: GoogleFont[];
}

export class GoogleFontsService {
  private static readonly API_KEY = 'AIzaSyDummyKey'; // We'll use the free API without key for basic functionality
  private static readonly BASE_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';
  private static cachedFonts: GoogleFont[] | null = null;

  static async getPopularFonts(): Promise<GoogleFont[]> {
    if (this.cachedFonts) {
      return this.cachedFonts;
    }

    try {
      // Use a curated list of popular fonts instead of API call to avoid API key requirement
      const popularFonts: GoogleFont[] = [
        { family: 'Inter', variants: ['400', '500', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Roboto', variants: ['400', '500', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Open Sans', variants: ['400', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Lato', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Poppins', variants: ['400', '500', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Montserrat', variants: ['400', '500', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Source Sans Pro', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Nunito', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'PT Sans', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Ubuntu', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Playfair Display', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Merriweather', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Lora', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Fira Code', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'JetBrains Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
      ];

      this.cachedFonts = popularFonts;
      return popularFonts;
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      return this.getDefaultFonts();
    }
  }

  static getDefaultFonts(): GoogleFont[] {
    return [
      { family: 'Inter', variants: ['400', '500', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
      { family: 'Roboto', variants: ['400', '500', '700'], subsets: ['latin'], category: 'sans-serif' },
      { family: 'Open Sans', variants: ['400', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
    ];
  }

  static loadFont(fontFamily: string, variants: string[] = ['400']): void {
    const fontName = fontFamily.replace(/\s+/g, '+');
    const variantString = variants.join(',');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@${variantString}&display=swap`;
    link.rel = 'stylesheet';
    
    // Remove existing font link if present
    const existingLink = document.querySelector(`link[href*="${fontName}"]`);
    if (existingLink) {
      existingLink.remove();
    }
    
    document.head.appendChild(link);
  }

  static getFontSlug(fontFamily: string): string {
    return fontFamily.toLowerCase().replace(/\s+/g, '-');
  }

  static getFontCSSClass(fontFamily: string): string {
    return `font-${this.getFontSlug(fontFamily)}`;
  }
}
