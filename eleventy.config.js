const path = require('path')
const { resolve } = require('path')

const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require('markdown-it-attrs');

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')


const pluginImages = require('./eleventy.images.js')

module.exports = function(eleventyConfig) {

	eleventyConfig.addPassthroughCopy('src/assets');

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("src/**/*.{svg,webp,png,jpeg}");

	// Official Plugins
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(pluginImages)

	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);

	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: '.11ty-vite', // Default name of the temp folder
	
		root: path.resolve(__dirname, 'src'),
	
		// Options passed to the Eleventy Dev Server
		// e.g. domdiff, enabled, etc.
	
		// Added in Vite plugin v2.0.0
		serverOptions: {},
	
		// Defaults are shown:
		viteOptions: {
		  // base: githubPath,
		  clearScreen: false,
		  appType: 'mpa', // New in v2.0.0
		  assetsInclude: ['**/*.xml', '**/*.txt', 'CNAME'],
		  base: '/', // use this instead of pathPrefix,
		  publicDir: 'public',
	
		  // plugins: [pagefind()],
	
		  server: {
			mode: 'development',
			middlewareMode: true
		  },
	
		  build: {
			mode: 'production'
		  },
	
		  // New in v2.0.0
		  resolve: {
			alias: {
			  // Allow references to `node_modules` folder directly
			  '/node_modules': path.resolve('.', 'node_modules'),
			  '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
			  '~icons': path.resolve(__dirname, 'node_modules/bootstrap-icons')
			}
		  }
		}
	  })

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "LLLL dd, yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// options to open external links in new tab
	const milaOptions = {
		pattern: /^https?:/,
		attrs: {
			target: "_blank",
			rel: "noopener noreferrer"
		}
	};

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", mdLib => {

		mdLib.use(markdownItAttrs, milaOptions);

		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "visually-hidden",
				symbol: "#",
				ariaHidden: false,
				visuallyHiddenClass: 'visually-hidden',
			}),
			level: [1,2,3,4],
			slugify: eleventyConfig.getFilter("slugify")
		});
	});

    return {
        templateFormats: [
            "md",
            "njk",
            "html",
            "liquid"
        ],

        // Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

        // These are all optional:
		dir: {
			input: "src",          // default: "."
			includes: "_includes",  // default: "_includes"
			layouts: "_layouts", 
			data: "_data",          // default: "_data"
			output: "_site"
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
    };
};