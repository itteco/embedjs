var iframely = require('./iframely');

iframely.VERSION = 1;

iframely.ASPECT_WRAPPER_CLASS = 'iframely-responsive';
iframely.MAXWIDTH_WRAPPER_CLASS = 'iframely-embed';
iframely.LOADER_CLASS = 'iframely-loader';

iframely.DOMAINS = ['cdn.iframe.ly', 'iframe.ly', 'if-cdn.com', 'iframely.net'];
iframely.CDN = iframely.CDN || iframely.DOMAINS[0]; // default domain, user or script src can change CDN

iframely.BASE_RE = /^(?:https?:)?\/\/[^/]+/i;
iframely.ID_RE = /^(?:https?:)?\/\/[^/]+\/(\w+)(?:\?.*)?$/;
iframely.SCRIPT_RE = /^(?:https?:|file:\/)?\/\/[^/]+(?:.+)?\/(?:embed|iframely)\.js(?:[^/]+)?$/i;
iframely.CDN_RE = /^(?:https?:)?\/\/([^/]+)\/(?:embed|iframely)\.js(?:[^/]+)?$/i;

iframely.SUPPORTED_QUERY_STRING = ['api_key', 'key', 'iframe', 'html5', 'playerjs', 'align', 'language', 'media', 'maxwidth', 'lazy', 'import', 'parent', 'click_to_play', 'autoplay', 'mute', /^_.+/];

iframely.LAZY_IFRAME_SHOW_TIMEOUT = 3000;
iframely.LAZY_IFRAME_FADE_TIMEOUT = 200;
iframely.CLEAR_WRAPPER_STYLES_TIMEOUT = 3000;