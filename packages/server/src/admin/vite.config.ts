import { mergeConfig, type UserConfig, type Plugin, type IndexHtmlTransformResult } from 'vite';

/**
 * Prism stub script that creates window.Prism before modules load.
 * This is injected into index.html via Vite's transformIndexHtml hook.
 */
const PRISM_STUB_SCRIPT = `
<script>
(function() {
  if (typeof window !== 'undefined' && !window.Prism) {
    window.Prism = {
      manual: true,
      disableWorkerMessageHandler: true,
      languages: {
        plaintext: { text: { pattern: /[\\s\\S]+/ } },
        txt: { text: { pattern: /[\\s\\S]+/ } }
      },
      tokenize: function(text, grammar) {
        if (!grammar) return [text];
        var tokens = [];
        for (var token in grammar) {
          if (!grammar.hasOwnProperty(token) || !grammar[token]) continue;
          var pattern = grammar[token].pattern || grammar[token];
          if (!(pattern instanceof RegExp)) continue;
          var match, regex = new RegExp(pattern.source, 'g');
          while ((match = regex.exec(text)) !== null) {
            tokens.push({ type: token, content: match[0], length: match[0].length });
          }
        }
        return tokens.length ? tokens : [text];
      },
      hooks: { all: {}, run: function() {} },
      plugins: {}
    };
  }
})();
</script>`;

/**
 * Plugin to fix the "Prism is not defined" error in Strapi admin.
 *
 * 1. Injects a Prism stub into index.html (runs before any modules)
 * 2. Wraps prismjs language components to use window.Prism
 *
 * @see https://github.com/strapi/strapi/issues/25070
 */
function prismjsGlobalPlugin(): Plugin {
  return {
    name: 'prismjs-global',
    enforce: 'pre',

    // Inject Prism stub into index.html
    transformIndexHtml(html): IndexHtmlTransformResult {
      // Insert after <title> tag so it runs early
      return html.replace(
        /<\/title>/,
        `</title>${PRISM_STUB_SCRIPT}`
      );
    },

    // Wrap prismjs language components to use window.Prism
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');

      if (normalizedId.includes('node_modules/prismjs/components/prism-')) {
        return {
          code: `(function(Prism) {
  if (!Prism) return;
${code}
})(typeof window !== 'undefined' ? window.Prism : undefined);`,
          map: null,
        };
      }

      return null;
    },
  };
}

export default (config: UserConfig) => {
  return mergeConfig(config, {
    plugins: [prismjsGlobalPlugin()],
    optimizeDeps: {
      force: true,
      exclude: ['prismjs'],
    },
  } satisfies UserConfig);
};
