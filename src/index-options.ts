import './dom-ready';
import iframely from './iframely';
import { boot as bootConst } from './const';
import { boot as bootEvents } from './events';
import { boot as bootUtils } from './utils';
import { boot as bootMessaging } from './messaging';
import { boot as bootIntersection } from './intersection';
import { boot as bootTheme } from './theme';
import { boot as bootImport } from './import';
import { boot as bootAhref } from './ahref';
import { boot as bootLazyImgPlaceholder } from './lazy-img-placeholder';
import { boot as bootLazyIframe } from './lazy-iframe';
import { boot as bootWidgetCancel } from './widget-cancel';
import { boot as bootWidgetResize } from './widget-resize';
import { boot as bootWidgetClick } from './widget-click';
import { boot as bootWidgetOptions } from './widget-options';
import { boot as bootDeprecated } from './deprecated';
import { boot as bootOptions } from './options/index';

// Same bootstrap as index.ts plus the options form builder.
// See index.ts for why boot() functions replace CJS side-effect requires.
if (!iframely._loaded) {

    iframely._loaded = true;

    bootConst();
    bootEvents();
    bootUtils();
    bootMessaging();
    bootIntersection();
    bootTheme();
    bootImport();
    bootAhref();
    bootLazyImgPlaceholder();
    bootLazyIframe();
    bootWidgetCancel();
    bootWidgetResize();
    bootWidgetClick();
    bootWidgetOptions();
    bootDeprecated();
    bootOptions();

    iframely.trigger('init');
}
