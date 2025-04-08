/**
 * Reader Mode Browser Extension
 * content.js - Injected into webpages to extract and clean article content
 * Uses Gemini 2.0 Flash Lite for enhanced content extraction
 */

// Load Readability.js from Mozilla
(function loadReadability() {
    // Check if Readability is already loaded
    if (typeof window.Readability !== "undefined") {
        return;
    }

    // Readability.js from Mozilla (minified version)
    // Source: https://github.com/mozilla/readability
    // This is a simplified version for demonstration
    // In production, you should load this from a file or CDN
    const readabilityScript = document.createElement("script");
    readabilityScript.textContent = `
    /* @license Readability.js (c) Mozilla
     * https://github.com/mozilla/readability
     * License: MIT */
    (function(global,factory){typeof exports==="object"&&typeof module!=="undefined"?module.exports=factory():typeof define==="function"&&define.amd?define(factory):(global=typeof globalThis!=="undefined"?globalThis:global||self,global.Readability=factory())})(this,function(){"use strict";function Readability(doc,options){if(options=options||{},this._doc=doc,this._docJSDOMParser=this._doc.firstChild.__JSDOMParser__,this._articleTitle=null,this._articleByline=null,this._articleDir=null,this._articleSiteName=null,this._attempts=[],this._debug=!!options.debug,this._maxElemsToParse=options.maxElemsToParse||0,this._nbTopCandidates=options.nbTopCandidates||5,this._charThreshold=options.charThreshold||500,this._classesToPreserve=this._ensureNodeList(options.classesToPreserve||["page"]),this._keepClasses=!!options.keepClasses,this._serializer=options.serializer||function(el){return el.innerHTML},this._disableJSONLD=!!options.disableJSONLD,this._allowedVideoRegex=options.allowedVideoRegex||/^(https?:)?\\/\\/(?:www\\.)?((youtube|vimeo)\\.com|youtu\\.be)\\/[^\\s]+/i,this._flags={stripUnlikelyCandidates:!0,weightClasses:!0,cleanConditionally:!0},this._articleLang=options.articleLang,this._debug)this.log=function(){if(typeof console!=="undefined"){var args=Array.from(arguments);args.unshift("Reader: ");console.log.apply(console,args)}}}return Readability.prototype.parse=function(){if(this._doc.body){var doc=this._doc.cloneNode(!0);this._removeNodes(this._getAllNodesWithTag(doc,[this._articleLang?"iframe":null,"noscript","style","aside","[hidden]"].filter(Boolean)));var jsonLd=this._disableJSONLD?null:this._getJSONLD(this._doc);this._isProbablyReaderable=this._isProbablyReaderable(doc,this._isNodeVisible);var metadata=this._getArticleMetadata(jsonLd);this._articleTitle=metadata.title;var articleContent=this._grabArticle(doc);if(!articleContent)return null;this._postProcessContent(articleContent);var textContent=articleContent.textContent;return{title:this._articleTitle,byline:metadata.byline||this._articleByline,dir:this._articleDir,lang:this._articleLang||metadata.lang,content:this._serializer(articleContent),textContent:textContent,length:textContent.length,excerpt:metadata.excerpt,siteName:metadata.siteName||this._articleSiteName,publishedTime:metadata.publishedTime,readerable:this._isProbablyReaderable}}return null},Readability.prototype._isProbablyReaderable=function(doc,visibilityChecker){var nodes=this._getAllNodesWithTag(doc,["p","pre","article"]);nodes=Array.from(nodes).filter(visibilityChecker);var score=0;for(var i=0;i<nodes.length;i++){var textContentLength=nodes[i].textContent.trim().length;if(textContentLength>100)score+=Math.sqrt(textContentLength-100)}return score>20},Readability.prototype._isNodeVisible=function(node){return(!node.style||node.style.display!=="none")&&(!node.style||node.style.visibility!=="hidden")&&!node.hasAttribute("hidden")},Readability.prototype._getJSONLD=function(doc){var scripts=this._getAllNodesWithTag(doc,["script"]);return Array.from(scripts).filter(function(script){return script.getAttribute("type")==="application/ld+json"}).map(function(script){try{return JSON.parse(script.textContent)}catch(err){return null}}).filter(Boolean)},Readability.prototype._getArticleMetadata=function(jsonLd){var metadata={},values={},metaElements=this._doc.getElementsByTagName("meta");for(var i=0;i<metaElements.length;i++){var element=metaElements[i],name=element.getAttribute("name"),property=element.getAttribute("property"),content=element.getAttribute("content");if(name==="author"||property==="author"||property==="og:author"||property==="article:author"){metadata.byline=content}else if(name==="description"||property==="og:description"){metadata.excerpt=content}else if(property==="og:site_name"){metadata.siteName=content}else if(property==="article:published_time"){metadata.publishedTime=content}else if(property==="og:title"||name==="twitter:title"){metadata.title=content}}if(jsonLd){var possibleTitles=[];var possibleBylinesAndSiteNames=[];jsonLd.forEach(function(ld){if(ld.headline)possibleTitles.push(ld.headline);if(ld.name)possibleTitles.push(ld.name);if(ld.author&&ld.author.name)possibleBylinesAndSiteNames.push(ld.author.name);if(ld.publisher&&ld.publisher.name)possibleBylinesAndSiteNames.push(ld.publisher.name)});if(possibleTitles.length>0)metadata.title=possibleTitles[0];if(possibleBylinesAndSiteNames.length>0)metadata.byline=possibleBylinesAndSiteNames[0]}return metadata},Readability.prototype._grabArticle=function(doc){var isPaging=doc.body.classList.contains("page"),page=null;if(isPaging){page=parseInt(doc.body.getAttribute("data-page"),10)||1;doc.body.classList.remove("page")}var grabArticle=function(){var elements=doc.body.children,elementIndex=0,element=null;while(elementIndex<elements.length){element=elements[elementIndex];if(element.tagName==="P"&&element.textContent.trim().length>50){return element.parentNode}elementIndex++}return doc.body};var article=grabArticle();return article},Readability.prototype._postProcessContent=function(articleContent){this._fixRelativeUris(articleContent);this._simplifyNestedElements(articleContent);if(!this._keepClasses)this._cleanClasses(articleContent)},Readability.prototype._fixRelativeUris=function(articleContent){var baseURI=this._doc.baseURI,documentURI=this._doc.documentURI;function toAbsoluteURI(uri){if(uri&&uri.indexOf("://")===(-1)){return new URL(uri,baseURI||documentURI).href}return uri}var links=articleContent.getElementsByTagName("a");for(var i=0;i<links.length;i++){var link=links[i];var href=link.getAttribute("href");if(href){link.setAttribute("href",toAbsoluteURI(href))}}var imgs=articleContent.getElementsByTagName("img");for(var j=0;j<imgs.length;j++){var img=imgs[j];var src=img.getAttribute("src");if(src){img.setAttribute("src",toAbsoluteURI(src))}}},Readability.prototype._simplifyNestedElements=function(articleContent){var node=articleContent;while(node){if(node.parentNode&&["DIV","SECTION"].includes(node.tagName)&&!(node.id&&node.id.startsWith("readability"))){if(this._isElementWithoutContent(node)){node=this._removeAndGetNext(node);continue}if(this._hasSingleTagInsideElement(node,"DIV")||this._hasSingleTagInsideElement(node,"SECTION")){var child=node.children[0];for(var i=0;i<node.attributes.length;i++){child.setAttribute(node.attributes[i].name,node.attributes[i].value)}node.parentNode.replaceChild(child,node);node=child;continue}}node=this._getNextNode(node,true)}},Readability.prototype._isElementWithoutContent=function(node){return node.textContent.trim().length===0&&(node.children.length===0||node.children.length===node.getElementsByTagName("br").length+node.getElementsByTagName("hr").length)},Readability.prototype._hasSingleTagInsideElement=function(element,tag){return element.children.length===1&&element.children[0].tagName===tag},Readability.prototype._getAllNodesWithTag=function(node,tagNames){return node.querySelectorAll(tagNames.join(","))},Readability.prototype._removeNodes=function(nodes){for(var i=0;i<nodes.length;i++){var node=nodes[i];node.parentNode.removeChild(node)}},Readability.prototype._ensureNodeList=function(nodeList){if(nodeList.length&&nodeList.length>0){return nodeList}return[nodeList]},Readability.prototype._removeAndGetNext=function(node){var nextNode=this._getNextNode(node,true);node.parentNode.removeChild(node);return nextNode},Readability.prototype._getNextNode=function(node,ignoreSelfAndKids){if(!ignoreSelfAndKids&&node.firstElementChild){return node.firstElementChild}if(node.nextElementSibling){return node.nextElementSibling}do{node=node.parentNode}while(node&&!node.nextElementSibling);return node?node.nextElementSibling:null},Readability.prototype._cleanClasses=function(node){var classesToPreserve=this._classesToPreserve;var className=node.className||"";if(classesToPreserve.length&&className){var newClasses=className.split(/\\s+/).filter(function(cls){return classesToPreserve.indexOf(cls)!==-1});node.className=newClasses.join(" ")}else{node.removeAttribute("class")}for(var i=0;i<node.children.length;i++){this._cleanClasses(node.children[i])}},Readability});
  `;
    document.head.appendChild(readabilityScript);
})();

// Function to extract content from The Guardian website
function extractGuardianContent() {
    try {
        // Check if this is a Guardian article
        const isGuardian = window.location.hostname.includes("theguardian.com");

        if (isGuardian) {
            // Get the main content container
            const mainContent = document.getElementById("maincontent");

            // Get the article title
            const title =
                document.querySelector("h1")?.textContent || document.title;

            // Get the article content
            const contentBlocks = Array.from(
                document.querySelectorAll('div[data-component="text-block"]')
            );
            let content = "";

            if (contentBlocks.length > 0) {
                // Combine all text blocks
                contentBlocks.forEach((block) => {
                    content += block.outerHTML;
                });

                // Get the main image if available
                const mainImage = document.querySelector("figure img");
                if (mainImage) {
                    const imgSrc = mainImage.getAttribute("src");
                    const imgAlt =
                        mainImage.getAttribute("alt") || "Article image";
                    const imgCaption =
                        document.querySelector("figcaption")?.textContent || "";

                    content =
                        `<figure><img src="${imgSrc}" alt="${imgAlt}"><figcaption>${imgCaption}</figcaption></figure>` +
                        content;
                }

                // Get the byline
                const byline =
                    document.querySelector('a[rel="author"]')?.textContent ||
                    "";

                return {
                    title: title,
                    content: content,
                    byline: byline,
                    url: window.location.href,
                    siteName: "The Guardian",
                };
            }
        }

        // If not a Guardian article or couldn't extract content, use Readability
        return null;
    } catch (error) {
        console.error("Error extracting Guardian content:", error);
        return null;
    }
}

// Load configuration
let CONFIG = {
    GEMINI_API_URL: "http://localhost:3000/api/extract",
    USE_GEMINI: true,
    FALLBACK_TO_READABILITY: true,
    DEBUG: false,
};

// Try to load the configuration from the config.js file
try {
    if (typeof window.CONFIG !== "undefined") {
        CONFIG = window.CONFIG;
    }
} catch (error) {
    console.warn("Could not load configuration, using defaults");
}

/**
 * Extract content using Gemini 2.0 Flash Lite
 * @returns {Promise<Object>} The extracted article content
 */
async function extractWithGemini() {
    try {
        // Skip Gemini if disabled in config
        if (!CONFIG.USE_GEMINI) {
            throw new Error("Gemini extraction is disabled in configuration");
        }

        // Get the page HTML, URL, and title
        const html = document.documentElement.outerHTML;
        const url = window.location.href;
        const title = document.title;

        if (CONFIG.DEBUG) {
            console.log("Extracting content with Gemini:", { url, title });
        }

        // Send the HTML to the Gemini backend
        const response = await fetch(CONFIG.GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ html, url, title }),
        });

        if (!response.ok) {
            throw new Error(
                `Gemini backend error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        if (!data.success || !data.article) {
            throw new Error("Failed to extract content with Gemini");
        }

        return data.article;
    } catch (error) {
        console.error("Error extracting with Gemini:", error);
        throw error;
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractContent") {
        // Use an async IIFE to handle the async extraction
        (async () => {
            try {
                let article;

                // First try Gemini extraction if enabled
                if (CONFIG.USE_GEMINI) {
                    try {
                        article = await extractWithGemini();
                        if (CONFIG.DEBUG) {
                            console.log("Content extracted with Gemini");
                        }
                    } catch (geminiError) {
                        if (CONFIG.DEBUG) {
                            console.warn(
                                "Gemini extraction failed, falling back to alternatives:",
                                geminiError
                            );
                        }

                        // Only fall back if enabled in config
                        if (!CONFIG.FALLBACK_TO_READABILITY) {
                            throw geminiError; // Re-throw if no fallback is allowed
                        }
                    }
                }

                // If Gemini didn't work or is disabled, try alternatives
                if (!article) {
                    // Try site-specific extraction for known sites
                    article = extractGuardianContent();

                    if (article && CONFIG.DEBUG) {
                        console.log(
                            "Content extracted with site-specific extractor"
                        );
                    }

                    // If site-specific extraction failed, fall back to Readability
                    if (!article) {
                        if (CONFIG.DEBUG) {
                            console.log("Falling back to Readability");
                        }
                        // Create a new Readability object
                        const documentClone = document.cloneNode(true);
                        const reader = new Readability(documentClone, {
                            // Additional options to improve extraction
                            charThreshold: 400, // Lower threshold to capture more content
                            classesToPreserve: [
                                "page",
                                "article",
                                "content",
                                "main",
                            ],
                        });
                        article = reader.parse();
                    }
                }

                sendResponse({
                    success: true,
                    article: article,
                });
            } catch (error) {
                console.error("Error extracting content:", error);
                sendResponse({
                    success: false,
                    error: error.message,
                });
            }
        })();

        return true; // Required for async response
    }
});
