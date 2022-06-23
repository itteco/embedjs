var translator = require('../translator');

var lang ='de';

var labels = {
    // general options
    'Slimmer horizontal player': 'Schlanker horizontaler Player',
    'Include playlist': 'Wiedergabeliste anzeigen',
    'Hide artwork': 'Artwork ausblenden',
    'Theme color': 'Theme Farbe',
    'Light': 'Hell',
    'Dark': 'Dunkel',
    'Auto': 'Automatisch',
    'Default': 'Standard',
    'Adjust height': 'Höhe einstellen',
    'Active page': 'Aktive Seite',

    // Codepen
    'Use click-to-load': 'Verwende click-to-load',
    'ex.: 600, in px': 'Z.B. 600, in px',

    //Instagram
    'Hide timed comments': 'Kommentare ausblenden',

    //Soundcloud
    'Let Iframely optimize player for the artwork': 'Optimierung des Players durch IFramely',

    // scribd
    'Show as slideshow': 'Als Slideshow zeigen',

    // youtube
    'Start from': 'Start ab',
    'ex.: 11, 1m10s': 'z.B. 11, 1m10s',
    'End on': 'Ende an',
    'Closed captions': 'Untertitel',

    // twitter
    'Include up to 20 tweets': 'Bis zu 20 Tweets anzeigen',
    'Hide photos, videos, and cards': 'Verberge Fotos, Videos und Cards',
    'Hide previous Tweet in conversation thread': 'Verberge den vorigen Tweet in der Konversation',
    'Use dark theme': 'Verwende dunkles Farbschema',
    'Adjust width': 'Breite anpassen',

    // pinterest
    'Hide description': 'Beschreibung verbergen',

    //mixcloud
    'Widget style': 'Widget-Style',
    'Mini': 'Mini',
    'Classic': 'Klassisch',
    'Picture': 'Bild',

    //google maps
    'Zoom': 'Zoom',
    'Map orientation': 'Karten-Ausrichtung',
    'Album': 'Album',
    'Portrait': 'Portrait',
    'Square': 'Quadratisch',

    // Flickr
    'Show context slideshow': 'Als Slideshow anzeigen',
    'Show description footer': 'Fußzeile anzeigen',
    'Show user header': 'Kopfbereich anzeigen',

    //facebook
    'Show author\'s text caption': 'Beschriftung des Autors anzeigen',
    'Hide author\'s text caption': 'Beschriftung des Autors verbergen',
    'Include parent comment (if url is a reply)': 'Ursprünglichen Kommentar einschließen (wenn die Url eine Antwort ist)',

    'Show recent posts': 'Neueste Beiträge anzeigen',
    'Show profile photos when friends like this': 'Profilfotos anzeigen, wenn Freunde dies mögen',
    'Use the small header instead': 'Kleine Kopfzeile stattdessen verwenden',

    //bandcamp
    'Artwork': 'Artwork',
    'Small': 'klein',
    'Big': 'groß',
    'None': 'Keines',

    'Layout': 'Layout',
    'Slim': 'Schlank',
    'Artwork-only': 'Nur Artwork',
    'Standard': 'Standard',

    //omny.fm
    'Size & style': 'Größe & Stil',
    'Wide image': 'Breite Darstellung',
    'Wide simple': 'Breite Darstellung (Einfach)',

     // Vimeo
    'Text language (ignored if no captions)': 'Sprache der Untertitel (wird ignoriert, wenn keine Untertitel vorhanden)',
    'Two letters: en, fr, es, de...': 'Zwei Buchstaben: en, fr, es, de...',
    
     // Kickstarter
    'Don\'t include attached player': 'Player nicht integrieren',
    'Attached player only, no card': 'Nur Player, keine Card',

    //iframely options
    'Hold load & play until clicked': 'Klicken zum Abspielen',
    'Make it a small card': 'Kleine Card verwenden',
    //iframely media cards
    'Keep using full media card': 'Verwende weiterhin vollständige Media-Cards',
    'Don\'t include player': 'Player nicht hinzufügen',
    'Player only, no card': 'Nur Player, keine Card',
    //iframely media=1
    'Just the player': 'Nur Player',
    'Just the image': 'Nur Bild'
};

translator.registerLabels(lang, labels);
