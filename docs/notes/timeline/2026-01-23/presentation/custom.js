// Reveal.js Configuration
Reveal.initialize({
    hash: true,
    width: 1440,
    height: 900,
    margin: 0.1,
    minScale: 0.2,
    maxScale: 2.0,

    // Transition settings
    transition: 'slide',
    transitionSpeed: 'default',
    backgroundTransition: 'fade',

    // Keyboard and navigation
    keyboard: true,
    touch: true,
    navigationMode: 'default',

    // Fragments
    fragmentInURL: true,
    preloadIframes: null,

    // Plugin configuration
    plugins: [
        RevealMarkdown,
        RevealHighlight,
        RevealNotes,
    ],

    // Markdown configuration
    markdown: {
        smartypants: true,
        smartyPants: true
    },

    // Highlight configuration
    highlight: {
        beforeHighlight: (highlighter, code, lang) => {
            return highlighter.highlight(code, { language: lang, ignoreIllegals: true });
        }
    },

    // Custom slide numbers
    slideNumber: 'c/t',

    // Speaker view
    showNotes: false,
    notesSeparator: 'note:',

    // Help overlay
    help: true,

    // RTL support
    rtl: false,

    // Vertical slides centering
    center: true,

    // Embedded media
    video: {
        preloadIframes: true
    }
});

// Custom keyboard shortcuts
Reveal.on('ready', event => {
    console.log('Presentation initialized');
});

// Add custom event listeners
document.addEventListener('keydown', event => {
    // Optional: Add custom keyboard shortcuts here
});

// Auto-number slides for accessibility
document.addEventListener('slidechanged', event => {
    const slideNumber = event.indexh + '.' + event.indexv;
    // Can be used for logging or analytics
});
