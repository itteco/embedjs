var utils = require('./utils');
var iframely = require('./iframely');

// widgetsCache is used from inside import doc for js callbacks and custom features
var widgetsCache = {};

iframely.on('load', function(el) {

    // load once, if import is not in process and only if query-string from script src has not disabled import
    if (!el && iframely.config.import !== false             
            && isImportAble()
            && !iframely.import) {

        var elements = document.querySelectorAll('a[data-iframely-url]:not([data-import-uri])');
        if (elements.length > 1) {
            makeImportAPICall(elements);
        }
    }

});

iframely.on('load', function(widget, importOptions) {

    if (widget && widget.uri && (widget.html || widget.cancel)) {

        var els = widgetsCache[widget.uri];
        // alternatively, could as well do querySelectorAll('a[data-iframely-url][data-import="' + template.getAttribute('data-uri') + '"')

        if (els) {
            for (var i = 0; i < els.length; i++) {
                loadImportWidget(widget, els[i], importOptions);
            }
        }

        delete widgetsCache[widget.uri];
    }
});

function makeImportAPICall(elements) {

    var script = document.createElement('script');

    var uris = [];
    var ids = [];
    
    var import_options = null; // will be populated from first element; or will remain as null if no params in elements...

    // couple helper functions first

    function pushElement(uri, el) {
        if (!widgetsCache[uri]) {
            widgetsCache[uri] = [];
        }

        widgetsCache[uri].push(el);
    }

    function queueElement(el) {
        var src = el.getAttribute('data-iframely-url');

        var mId = src.match(iframely.ID_RE);
        var id = mId && mId[1];

        var options = utils.parseQueryString(src, iframely.SUPPORTED_QUERY_STRING.concat('url'));

        var url = options.url; // can be undefined for IDs
        delete options.url;

        // skip import on import=0, playerjs=1
        var skipImport = options.import === '0' || options.import === 'false' 
                    || options.playerjs === '1' || options.playerjs === 'true';

        // or if link's query-string params or CDN are different from the others
        if (!skipImport) {
            var mBase = src.match(iframely.BASE_RE);
            options.CDN = mBase && mBase[0]; // will fall back to iframely.CDN in getEndpoint('/import...' ...)

            // set import options from the first el in import
            // that includes api keys 
            if (!import_options) {
                import_options = options;

            // else check that this el's options are the same as the first one's in import
            } else if (JSON.stringify(options, Object.keys(options).sort()) 
                    !== JSON.stringify(import_options, Object.keys(import_options).sort())) {

                skipImport = true;
            }
        }


        if (skipImport) {
            // Usual build if no uri and app=1s.
            iframely.trigger('load', el);

        } else if (id) {
            el.setAttribute('data-import-uri', id);
            if (ids.indexOf(id) === -1) {
                ids.push(id);
            }
            pushElement(id, el);

        } else {

            if (!url) {
                url = el.getAttribute('href');
            }

            var key = import_options.key || import_options.api_key || iframely.config.api_key || iframely.config.key;

            if (key && url) {

                el.setAttribute('data-import-uri', url);
                if (uris.indexOf(url) === -1) {
                    uris.push(url);
                }
                pushElement(url, el);
            } else {
                // Usual build if no uri.
                iframely.trigger('load', el);
            }
        }
    }


    // start actual filling up of import request

    for(var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (!el.getAttribute('data-import-uri') && el.hasAttribute('data-iframely-url')) {
            queueElement(el);
        }
    }

    if ((uris.length > 0 || ids.length > 0)) {

        import_options = import_options || {};
        import_options.touch = iframely.isTouch();
        import_options.flash = hasFlash();
        import_options.app = 1;

        if (uris.length > 0) {
            import_options.uri = uris;
        }

        if (ids.length > 0) {
            import_options.ids = ids.join('&');
        }

        import_options.v = iframely.VERSION;

        script.src = utils.getEndpoint('/api/import/v2', import_options, iframely.SUPPORTED_QUERY_STRING);

        script.onerror = function() {
            // Error loading import. No import this time.
            importReady();
        };

        document.head.appendChild(script);
        iframely.import = script;

    } else {
        importReady();
        iframely.trigger('load');
    }
}

iframely.buildImportWidgets = function(importOptions) {

    iframely.trigger('import-loaded', importOptions);

    importOptions.widgets.forEach(function(widget) {
        iframely.trigger('load', widget, importOptions);
    });

    importReady();
};

function loadImportWidget(widgetOptions, el, importOptions) {

    var needCancelWidget = widgetOptions.cancel;
    var shadow = widgetOptions.shadow;
    var hasRenderedEvent = widgetOptions.renderEvent;

    var wrapper = utils.getIframeWrapper(el, true);
    var widget;

    if (needCancelWidget) {
        widget = utils.getWidget(el);

        iframely.cancelWidget(widget || {
            maxWidthWrapper: el,
            iframe: el,
            url: el.getAttribute('href')            
        });

    } else {

        widget = document.createElement('div');
        widget.innerHTML = widgetOptions.html;
        
        var parent, replacedEl;

        if (wrapper && !hasRenderedEvent) {
            // Inline widget will replace 'aspectWrapper' but keep 'maxWidthWrapper' as 'iframely-embed' to fix centering, etc.
            // If has rendered event - keep wrapper and remove attrs later by event.
            parent = wrapper.aspectWrapper.parentNode;
            replacedEl = wrapper.aspectWrapper;

            // Clear custom attributes.
            wrapper.maxWidthWrapper.removeAttribute('style');
        } else {
            // No wrapper or keep wrapper for later removal.
            parent = el.parentNode;
            replacedEl = el;
        }

        if (shadow) {

            var shadowContainer = document.createElement('div');
            var shadowRoot = shadowContainer.attachShadow({mode: 'open'});
            shadowRoot.appendChild(widget);

            var shadowWidgetOptions = {
                shadowRoot: shadowRoot,
                shadowContainer: shadowContainer,
                container: parent,
                context: widgetOptions.context,
                stylesIds: widgetOptions.stylesIds,
                stylesDict: importOptions.commonShadowStyles
            };
            
            iframely.trigger('import-shadow-widget-before-render', shadowWidgetOptions);
            
            parent.insertBefore(shadowContainer, replacedEl);

            iframely.trigger('import-shadow-widget-after-render', shadowWidgetOptions);
            
        } else {

            parent.insertBefore(widget, replacedEl);

            exec_body_scripts(widget);
        }

        parent.removeChild(replacedEl);

        if (hasRenderedEvent) {
            setTimeout(function() {
                clearWrapperStylesAndClass(parent);
            }, iframely.CLEAR_WRAPPER_STYLES_TIMEOUT);
        }
    }
}


function importReady() {

    delete iframely.import;

    // clean up all, let other loaders have a go
    var failed_elements = document.querySelectorAll('a[data-iframely-url][data-import-uri]');
    for(var i = 0; i < failed_elements.length; i++) {
        failed_elements[i].removeAttribute('data-import-uri');
        iframely.trigger('load', failed_elements[i]);
    }
}

iframely.isTouch = function() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

function hasFlash() {

    var _hasFlash = false;

    try {
        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (fo) {
            _hasFlash = true;
        } else {
            _hasFlash = false;
        }
    } catch (e) {
        if (navigator.mimeTypes
            && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
            && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
            _hasFlash = true;
        } else {
            _hasFlash = false;
        }
    }

    return _hasFlash;
}

function isImportAble() {

    return document.head.attachShadow
        && (iframely.debug || document.location.protocol === 'http:' || document.location.protocol === 'https:')  // Skip import on file:///
        && !iframely.config.playerjs && !iframely.config.lazy;
        // && !navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        // TODO: test in Firefox 63
}

function clearWrapperStylesAndClass(el) {
    var aspectWrapper = el;
    var parents = 0;
    while(aspectWrapper && aspectWrapper.getAttribute('class') !== iframely.ASPECT_WRAPPER_CLASS) {
        aspectWrapper = aspectWrapper.parentNode;
        parents++;
        if (parents > 4) {
            // Do not search further 4 parents.
            aspectWrapper = null;
        }
    }
    var maxWidthWrapper = aspectWrapper && aspectWrapper.parentNode;
    if (maxWidthWrapper && maxWidthWrapper.getAttribute('class') === iframely.MAXWIDTH_WRAPPER_CLASS) {
        // Remove wrapper specific data. Leave only 'iframely-embed' parent class.
        aspectWrapper.removeAttribute('style');
        aspectWrapper.removeAttribute('class');
        maxWidthWrapper.removeAttribute('style');
    }
}

iframely.on('import-widget-ready', clearWrapperStylesAndClass);

// used in server templates

if (!iframely.addEventListener) {
    iframely.addEventListener = function(elem, type, eventHandle) {
        if (!elem) { return; }
        if ( elem.addEventListener ) {
            elem.addEventListener( type, eventHandle, false );
        } else if ( elem.attachEvent ) {
            elem.attachEvent( 'on' + type, eventHandle );
        } else {
            elem['on' + type] = eventHandle;
        }
    };
}

// TODO: move to import script.
function exec_body_scripts(body_el) {
    function nodeName(elem, name) {
        return elem.nodeName && elem.nodeName.toUpperCase() ===
            name.toUpperCase();
    }

    function evalScript(elem) {
        var data = (elem.text || elem.textContent || elem.innerHTML || '' ),
            script = document.createElement('script');

        if (elem.src) {
            script.src = elem.src;
        }
        script.type = 'text/javascript';
        try {
            // doesn't work on ie...
            script.appendChild(document.createTextNode(data));
        } catch(e) {
            // IE has funky script nodes
            script.text = data;
        }

        body_el.appendChild(script);
    }

    // main section of function
    var scripts = [],
        script,
        children_nodes = body_el.childNodes,
        child,
        i;

    for (i = 0; children_nodes[i]; i++) {
        child = children_nodes[i];
        if (nodeName(child, 'script' ) &&
            (!child.type || child.type.toLowerCase() === 'text/javascript' || child.type.toLowerCase() === 'application/javascript')) {
            scripts.push(child);
            body_el.removeChild(child);
        } else {
            exec_body_scripts(child);
        }
    }

    for (i = 0; scripts[i]; i++) {
        script = scripts[i];
        if (script.parentNode) {script.parentNode.removeChild(script);}
        evalScript(scripts[i]);
    }
}