var translator = require('../translator');

var lang ='fr';

var labels = {
    // general options
    'Slimmer horizontal player': 'Joueur de audio classique',
    'Include playlist': 'Inclure la playlist',
    'Hide artwork': 'Masquer la illustration',
    'Theme color': 'Couleur du thème',
    'Light': 'Lumière',
    'Dark': 'Sombre',
    'Auto': '',
    'Default': 'Défaut',
    'Adjust height': 'Height',
    'Active page': 'Page active',

    // Codepen
    'Use click-to-load': 'Utilisez click-to-load',
    'ex.: 600, in px': '',

    //Instagram
    'Hide timed comments': 'Masquer les commentaires',

    //Soundcloud
    'Let Iframely optimize player for the artwork': 'Optimiser le lecteur pour l\'illustration',

    // scribd
    'Show as slideshow': 'Montrer en diaporama',

    // youtube
    'Start from': 'Commencer',
    'ex.: 11, 1m10s': '',
    'End on': 'Fin sur',

    // twitter
    'Include up to 20 tweets': 'Incluez jusqu\'à 20 tweets',
    'Hide photos, videos, and cards': 'Masquer les photos, les vidéos et les cartes',
    'Hide previous Tweet in conversation thread': 'Masquer le tweet parent',

    // pinterest
    'Hide description': 'Masquer la description',

    //mixcloud
    'Widget style': 'Style de widget',
    'Mini': '', // can leave empty - will remain as is
    'Classic': 'Classique',
    'Picture': 'Image',

    //google maps
    'Zoom': '',
    'Map orientation': 'Orientation de la carte',
    'Album': '',
    'Portrait': '',
    'Square': 'Carré',

    // Flickr
    'Show context slideshow': 'Afficher le diaporama contextuel',
    'Show description footer': 'Afficher la description pied de page',
    'Show user header': 'Afficher l\'en-tête de l\'utilisateur',

    //facebook
    'Show author\'s text caption': 'Afficher la description de l\'auteur',
    'Hide author\'s text caption': 'Masquer la description de l\'auteur',
    'Include parent comment (if url is a reply)': '',

    'Show recent posts': 'Afficher les messages récents',
    'Show profile photos when friends like this': '',
    'Use the small header instead': 'Utilisez plutôt le petit en-tête',

    //bandcamp
    'Artwork': 'Ouvrages d\'art',
    'Small': 'Petite',
    'Big': 'Grosse',
    'None': 'Aucune',

    'Layout': 'Disposition',
    'Slim': 'Svelte',
    'Artwork-only': 'Oeuvre seule',
    'Standard': 'Standard',

    //omny.fm
    'Size & style': 'Style',
    'Wide image': 'Image large',
    'Wide simple': 'Large simple',


    //iframely options
    'Hold load & play until clicked': 'Click-to-play',
    'Make it a small card': 'Carte compacte',
    //iframely media cards
    'Keep using full media card': 'Continuez à utiliser la carte média complète',
    'Don\'t include player': 'Ne pas inclure la vidéo',
    'Player only, no card': 'La vidéo seulement, pas de carte',
    //iframely media=1
    'Just the player': 'Seulement la vidéo',
    'Just the image': 'Seulement l\'image'
};

translator.registerLabels(lang, labels);