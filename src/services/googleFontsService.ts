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
      // Common system fonts (these don't need to be loaded from Google Fonts)
      const systemFonts: GoogleFont[] = [
        { family: 'Arial', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Helvetica', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Times New Roman', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Times', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Calibri', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Georgia', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Verdana', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Tahoma', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Trebuchet MS', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Courier New', variants: ['400', '700'], subsets: ['latin'], category: 'monospace' },
        { family: 'Impact', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Comic Sans MS', variants: ['400', '700'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Palatino', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Garamond', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Book Antiqua', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Century Gothic', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Lucida Console', variants: ['400'], subsets: ['latin'], category: 'monospace' },
        { family: 'Monaco', variants: ['400'], subsets: ['latin'], category: 'monospace' },
        { family: 'Consolas', variants: ['400', '700'], subsets: ['latin'], category: 'monospace' },
        { family: 'Segoe UI', variants: ['400', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: '-apple-system', variants: ['400', '500', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'system-ui', variants: ['400', '500', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
      ];

      // Comprehensive list of 200+ popular Google Fonts across categories
      const popularFonts: GoogleFont[] = [
        // Sans-serif fonts (most popular)
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
        { family: 'Raleway', variants: ['400', '500', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Work Sans', variants: ['400', '500', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Nunito Sans', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Mukti', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Barlow', variants: ['400', '500', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'DM Sans', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'IBM Plex Sans', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Rubik', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Oxygen', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Karla', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Hind', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Titillium Web', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Fira Sans', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Assistant', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Merriweather Sans', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Muli', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Arimo', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Cabin', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Dosis', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Exo 2', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Heebo', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Quicksand', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Source Sans 3', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Overpass', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Encode Sans', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Manrope', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Red Hat Display', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Red Hat Text', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Public Sans', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Figtree', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Plus Jakarta Sans', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Kanit', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Lexend', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Be Vietnam Pro', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Albert Sans', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Outfit', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Space Grotesk', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Sora', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Urbanist', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Commissioner', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Epilogue', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Readex Pro', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Onest', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Schibsted Grotesk', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },

        // Serif fonts
        { family: 'Playfair Display', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Merriweather', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Lora', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'PT Serif', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Crimson Text', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'EB Garamond', variants: ['400', '500'], subsets: ['latin'], category: 'serif' },
        { family: 'Libre Baskerville', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Cormorant Garamond', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Source Serif Pro', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Noto Serif', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Vollkorn', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Alegreya', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Spectral', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Bitter', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Arvo', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Rokkitt', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Zilla Slab', variants: ['400', '500'], subsets: ['latin'], category: 'serif' },
        { family: 'IBM Plex Serif', variants: ['400', '500'], subsets: ['latin'], category: 'serif' },
        { family: 'Cardo', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Domine', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Neuton', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Gelasio', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Literata', variants: ['400', '500'], subsets: ['latin'], category: 'serif' },
        { family: 'Source Serif 4', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Fraunces', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Newsreader', variants: ['400', '500'], subsets: ['latin'], category: 'serif' },
        { family: 'Young Serif', variants: ['400'], subsets: ['latin'], category: 'serif' },
        { family: 'Cormorant', variants: ['400', '600'], subsets: ['latin'], category: 'serif' },
        { family: 'Petrona', variants: ['400', '500'], subsets: ['latin'], category: 'serif' },
        { family: 'Unna', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },

        // Monospace fonts
        { family: 'Fira Code', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'JetBrains Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'Source Code Pro', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'Roboto Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'Space Mono', variants: ['400', '700'], subsets: ['latin'], category: 'monospace' },
        { family: 'Inconsolata', variants: ['400', '700'], subsets: ['latin'], category: 'monospace' },
        { family: 'Ubuntu Mono', variants: ['400', '700'], subsets: ['latin'], category: 'monospace' },
        { family: 'IBM Plex Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'Courier Prime', variants: ['400', '700'], subsets: ['latin'], category: 'monospace' },
        { family: 'Fira Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'PT Mono', variants: ['400'], subsets: ['latin'], category: 'monospace' },
        { family: 'Anonymous Pro', variants: ['400', '700'], subsets: ['latin'], category: 'monospace' },
        { family: 'Cousine', variants: ['400', '700'], subsets: ['latin'], category: 'monospace' },
        { family: 'Cutive Mono', variants: ['400'], subsets: ['latin'], category: 'monospace' },
        { family: 'Overpass Mono', variants: ['400', '600'], subsets: ['latin'], category: 'monospace' },
        { family: 'Red Hat Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'Azeret Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'DM Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'Martian Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },

        // Display fonts
        { family: 'Oswald', variants: ['400', '500', '600'], subsets: ['latin'], category: 'display' },
        { family: 'Bebas Neue', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Anton', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Abril Fatface', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Righteous', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Kalam', variants: ['400', '700'], subsets: ['latin'], category: 'display' },
        { family: 'Fredoka One', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Comfortaa', variants: ['400', '700'], subsets: ['latin'], category: 'display' },
        { family: 'Fjalla One', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Archivo Black', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Bangers', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Bungee', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Lobster', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Pacifico', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Staatliches', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Alfa Slab One', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Changa', variants: ['400', '600'], subsets: ['latin'], category: 'display' },
        { family: 'Calistoga', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Fredoka', variants: ['400', '500'], subsets: ['latin'], category: 'display' },
        { family: 'Squada One', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Black Ops One', variants: ['400'], subsets: ['latin'], category: 'display' },
        { family: 'Orbitron', variants: ['400', '700'], subsets: ['latin'], category: 'display' },
        { family: 'Bai Jamjuree', variants: ['400', '500'], subsets: ['latin'], category: 'display' },
        { family: 'Chakra Petch', variants: ['400', '600'], subsets: ['latin'], category: 'display' },

        // Handwriting fonts
        { family: 'Dancing Script', variants: ['400', '700'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Kaushan Script', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Great Vibes', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Satisfy', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Caveat', variants: ['400', '700'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Shadows Into Light', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Amatic SC', variants: ['400', '700'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Indie Flower', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Handlee', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Permanent Marker', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Cookie', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Allura', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Alex Brush', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Courgette', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Patrick Hand', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Architects Daughter', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Cedarville Cursive', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Yellowtail', variants: ['400'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Tangerine', variants: ['400', '700'], subsets: ['latin'], category: 'handwriting' },
        { family: 'Rock Salt', variants: ['400'], subsets: ['latin'], category: 'handwriting' },

        // Additional popular fonts
        { family: 'Noto Sans', variants: ['400', '500', '700'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Noto Sans JP', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Noto Sans KR', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Noto Sans SC', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Noto Sans TC', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'M PLUS 1p', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'M PLUS Rounded 1c', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Sarabun', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Prompt', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Mitr', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Tajawal', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Cairo', variants: ['400', '600'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'Amiri', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Scheherazade New', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
        { family: 'Markazi Text', variants: ['400', '500'], subsets: ['latin'], category: 'serif' },
        { family: 'Recursive', variants: ['400', '500'], subsets: ['latin'], category: 'sans-serif' },
        { family: 'JetBrains Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'Victor Mono', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
        { family: 'Cascadia Code', variants: ['400', '500'], subsets: ['latin'], category: 'monospace' },
      ];

      // Combine system fonts first, then Google Fonts
      const allFonts = [...systemFonts, ...popularFonts];
      
      this.cachedFonts = allFonts;
      return allFonts;
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      return this.getDefaultFonts();
    }
  }

  static getDefaultFonts(): GoogleFont[] {
    return [
      { family: 'Arial', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
      { family: 'Times New Roman', variants: ['400', '700'], subsets: ['latin'], category: 'serif' },
      { family: 'Calibri', variants: ['400', '700'], subsets: ['latin'], category: 'sans-serif' },
      { family: 'Inter', variants: ['400', '500', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
      { family: 'Roboto', variants: ['400', '500', '700'], subsets: ['latin'], category: 'sans-serif' },
      { family: 'Open Sans', variants: ['400', '600', '700'], subsets: ['latin'], category: 'sans-serif' },
    ];
  }

  static loadFont(fontFamily: string, variants: string[] = ['400']): void {
    // Don't try to load system fonts from Google Fonts
    const systemFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Times', 'Calibri', 'Georgia', 
                         'Verdana', 'Tahoma', 'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS',
                         'Palatino', 'Garamond', 'Book Antiqua', 'Century Gothic', 'Lucida Console',
                         'Monaco', 'Consolas', 'Segoe UI', '-apple-system', 'system-ui'];
    
    if (systemFonts.includes(fontFamily)) {
      return; // System fonts don't need to be loaded
    }

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

  // Filter fonts by category
  static async getFontsByCategory(category: string): Promise<GoogleFont[]> {
    const allFonts = await this.getPopularFonts();
    return allFonts.filter(font => font.category === category);
  }

  // Search fonts by name
  static async searchFonts(query: string): Promise<GoogleFont[]> {
    const allFonts = await this.getPopularFonts();
    return allFonts.filter(font => 
      font.family.toLowerCase().includes(query.toLowerCase())
    );
  }
}
