import { r as HTTPResponse } from "../_libs/h3+rou3+srvx.mjs";
//#region #nitro/virtual/renderer-template
var rendererTemplate = () => new HTTPResponse("<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Drapeva — Heirloom Indian Silk Sarees</title>\n    <meta name=\"description\" content=\"Discover Drapeva — an atelier of heirloom sarees and bridal drapes. Handwoven by Indian master artisans, designed for the modern bride.\" />\n    <meta name=\"author\" content=\"Drapeva\" />\n    <meta name=\"theme-color\" content=\"#1a1612\" />\n    \n    <!-- Open Graph / Facebook -->\n    <meta property=\"og:type\" content=\"website\" />\n    <meta property=\"og:title\" content=\"Drapeva — Heirloom Indian Silk Sarees\" />\n    <meta property=\"og:description\" content=\"Handwoven silk sarees and bridal trousseaus, made-to-order in India.\" />\n    \n    <!-- Twitter -->\n    <meta name=\"twitter:card\" content=\"summary_large_image\" />\n    \n    <!-- Fonts -->\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n    <link href=\"https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap\" rel=\"stylesheet\" />\n    \n    <!-- Stylesheets -->\n    <link rel=\"stylesheet\" href=\"/src/styles.css\" />\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/start.ts\"><\/script>\n  </body>\n</html>\n", { headers: { "content-type": "text/html; charset=utf-8" } });
//#endregion
//#region ../node_modules/nitro/dist/runtime/internal/routes/renderer-template.mjs
function renderIndexHTML(event) {
	return rendererTemplate(event.req);
}
//#endregion
export { renderIndexHTML as default };
