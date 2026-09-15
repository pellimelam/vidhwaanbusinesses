name: Vidhwaan Production Optimization

on:
  push:
    branches:
      - main
      - master

  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: production-optimization-${{ github.repository }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  optimize:
    name: Optimize Production Files
    runs-on: ubuntu-latest

    steps:

      # ==========================================================
      # 1. CHECKOUT
      # ==========================================================

      - name: Checkout repository
        uses: actions/checkout@v7
        with:
          fetch-depth: 0

      # ==========================================================
      # 2. NODE.JS
      # ==========================================================

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: "24"
          package-manager-cache: false

      # ==========================================================
      # 3. VERIFY ENVIRONMENT
      # ==========================================================

      - name: Verify environment
        shell: bash
        run: |
          set -Eeuo pipefail

          echo "=============================================="
          echo " VIDHWAAN PRODUCTION OPTIMIZER"
          echo "=============================================="

          echo "Node:"
          node --version

          echo "NPM:"
          npm --version

          echo "Workspace:"
          echo "$GITHUB_WORKSPACE"

          test -d "$GITHUB_WORKSPACE"

          echo ""
          echo "✓ Environment verified."

      # ==========================================================
      # 4. INSTALL EXACT BUILD DEPENDENCIES
      # ==========================================================

      - name: Install build dependencies
        shell: bash
        run: |
          set -Eeuo pipefail

          BUILD_DIR="$RUNNER_TEMP/vidhwaan-builder"

          rm -rf "$BUILD_DIR"
          mkdir -p "$BUILD_DIR"

          cat > "$BUILD_DIR/package.json" <<'EOF'
          {
            "name": "vidhwaan-production-optimizer",
            "version": "1.0.0",
            "private": true,
            "dependencies": {
              "html-minifier-terser": "7.2.0",
              "clean-css": "5.3.3",
              "terser": "5.51.2",
              "javascript-obfuscator": "4.1.1"
            }
          }
          EOF

          cd "$BUILD_DIR"

          npm install \
            --ignore-scripts \
            --no-audit \
            --no-fund \
            --no-package-lock

          echo "BUILD_DIR=$BUILD_DIR" >> "$GITHUB_ENV"

          echo ""
          echo "✓ Build dependencies installed."

      # ==========================================================
      # 5. VERIFY DEPENDENCIES
      # ==========================================================

      - name: Verify build dependencies
        shell: bash
        run: |
          set -Eeuo pipefail

          cd "$BUILD_DIR"

          node <<'NODE'
          const html = require("html-minifier-terser");
          const css = require("clean-css");
          const terser = require("terser");
          const obfuscator = require("javascript-obfuscator");

          if (
            !html ||
            typeof html.minify !== "function"
          ) {
            throw new Error(
              "html-minifier-terser is unavailable."
            );
          }

          if (
            typeof css !== "function"
          ) {
            throw new Error(
              "clean-css is unavailable."
            );
          }

          if (
            !terser ||
            typeof terser.minify !== "function"
          ) {
            throw new Error(
              "terser is unavailable."
            );
          }

          if (
            !obfuscator ||
            typeof obfuscator.obfuscate !== "function"
          ) {
            throw new Error(
              "javascript-obfuscator is unavailable."
            );
          }

          console.log(
            "✓ html-minifier-terser loaded."
          );

          console.log(
            "✓ clean-css loaded."
          );

          console.log(
            "✓ terser loaded."
          );

          console.log(
            "✓ javascript-obfuscator loaded."
          );

          console.log(
            "✓ All production tools verified."
          );
          NODE

      # ==========================================================
      # 6. PRODUCTION OPTIMIZER
      #
      # IMPORTANT:
      #
      # Files are processed IN PLACE.
      #
      # Only files whose content hash has changed are processed.
      #
      # Already processed files are skipped.
      #
      # The manifest stores SHA-256 hashes.
      # ==========================================================

      - name: Optimize changed production files
        shell: bash
        run: |
          set -Eeuo pipefail

          cat > "$BUILD_DIR/optimize.cjs" <<'NODE'
          const fs = require("fs");
          const path = require("path");
          const crypto = require("crypto");

          const {
            minify: minifyHTML
          } = require("html-minifier-terser");

          const CleanCSS =
            require("clean-css");

          const {
            minify: minifyJS
          } = require("terser");

          const JavaScriptObfuscator =
            require("javascript-obfuscator");

          const WORKSPACE =
            process.env.GITHUB_WORKSPACE;

          if (!WORKSPACE) {
            throw new Error(
              "GITHUB_WORKSPACE is missing."
            );
          }

          const MANIFEST =
            path.join(
              WORKSPACE,
              ".github",
              "production-manifest.json"
            );

          const excludedDirectories =
            new Set([
              ".git",
              ".github",
              "node_modules",
              ".cache",
              ".next",
              "coverage",
              "dist",
              "build",
              "out"
            ]);

          const excludedFiles =
            new Set([
              "package-lock.json",
              "npm-shrinkwrap.json",
              "yarn.lock",
              "pnpm-lock.yaml"
            ]);

          const htmlFiles = [];
          const cssFiles = [];
          const jsFiles = [];
          const jsonFiles = [];

          function sha256(content) {
            return crypto
              .createHash("sha256")
              .update(content)
              .digest("hex");
          }

          function readManifest() {
            if (!fs.existsSync(MANIFEST)) {
              return {
                version: 1,
                files: {}
              };
            }

            try {
              const parsed =
                JSON.parse(
                  fs.readFileSync(
                    MANIFEST,
                    "utf8"
                  )
                );

              if (
                !parsed ||
                typeof parsed !== "object" ||
                typeof parsed.files !== "object"
              ) {
                throw new Error(
                  "Invalid production manifest."
                );
              }

              return parsed;
            } catch (error) {
              throw new Error(
                `Cannot read production manifest: ${error.message}`
              );
            }
          }

          function writeManifest(manifest) {
            fs.mkdirSync(
              path.dirname(MANIFEST),
              {
                recursive: true
              }
            );

            const temporary =
              `${MANIFEST}.tmp`;

            fs.writeFileSync(
              temporary,
              JSON.stringify(
                manifest,
                null,
                2
              ) + "\n",
              "utf8"
            );

            fs.renameSync(
              temporary,
              MANIFEST
            );
          }

          function walk(directory) {
            const entries =
              fs.readdirSync(
                directory,
                {
                  withFileTypes: true
                }
              );

            for (
              const entry of entries
            ) {
              if (
                entry.isDirectory() &&
                excludedDirectories.has(
                  entry.name
                )
              ) {
                continue;
              }

              if (
                entry.isFile() &&
                excludedFiles.has(
                  entry.name
                )
              ) {
                continue;
              }

              const full =
                path.join(
                  directory,
                  entry.name
                );

              if (entry.isDirectory()) {
                walk(full);
                continue;
              }

              if (!entry.isFile()) {
                continue;
              }

              const ext =
                path.extname(
                  entry.name
                ).toLowerCase();

              if (
                ext === ".html" ||
                ext === ".htm"
              ) {
                htmlFiles.push(full);
              }

              if (
                ext === ".css"
              ) {
                cssFiles.push(full);
              }

              if (
                ext === ".js"
              ) {
                jsFiles.push(full);
              }

              if (
                ext === ".json"
              ) {
                jsonFiles.push(full);
              }
            }
          }

          function relativeFile(file) {
            return path
              .relative(
                WORKSPACE,
                file
              )
              .split(path.sep)
              .join("/");
          }

          function oneLine(content) {
            return String(content)
              .replace(/^\uFEFF/, "")
              .replace(/\r\n/g, "")
              .replace(/\r/g, "")
              .replace(/\n/g, "")
              .trim();
          }

          async function processHTML(file) {
            const source =
              fs.readFileSync(
                file,
                "utf8"
              );

            const output =
              await minifyHTML(
                source,
                {
                  collapseWhitespace: true,
                  conservativeCollapse: false,
                  collapseInlineTagWhitespace: true,
                  removeComments: true,
                  removeRedundantAttributes: true,
                  removeScriptTypeAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  removeEmptyAttributes: true,
                  removeAttributeQuotes: true,
                  useShortDoctype: true,
                  minifyCSS: true,
                  minifyJS: true
                }
              );

            fs.writeFileSync(
              file,
              oneLine(output),
              "utf8"
            );
          }

          function processCSS(file) {
            const source =
              fs.readFileSync(
                file,
                "utf8"
              );

            const result =
              new CleanCSS({
                level: 2,
                format: false,
                sourceMap: false,
                rebase: false
              }).minify(source);

            if (
              result.errors &&
              result.errors.length
            ) {
              throw new Error(
                result.errors.join("\n")
              );
            }

            fs.writeFileSync(
              file,
              oneLine(result.styles),
              "utf8"
            );
          }

          async function processJS(file) {
            const source =
              fs.readFileSync(
                file,
                "utf8"
              );

            /*
             * First obfuscate the JavaScript.
             *
             * Conservative settings are intentional.
             * Aggressive control-flow flattening and
             * dead-code injection can damage production
             * applications and increase file size heavily.
             */

            const obfuscated =
              JavaScriptObfuscator.obfuscate(
                source,
                {
                  compact: true,

                  identifierNamesGenerator:
                    "hexadecimal",

                  renameGlobals: false,

                  simplify: true,

                  stringArray: true,

                  stringArrayCallsTransform: true,

                  stringArrayCallsTransformThreshold:
                    0.75,

                  stringArrayEncoding: [
                    "base64"
                  ],

                  stringArrayIndexShift: true,

                  stringArrayRotate: true,

                  stringArrayShuffle: true,

                  stringArrayWrappersCount: 1,

                  stringArrayWrappersChainedCalls:
                    true,

                  stringArrayWrappersParametersMaxCount:
                    2,

                  stringArrayWrappersType:
                    "variable",

                  splitStrings: false,

                  unicodeEscapeSequence: false,

                  controlFlowFlattening: false,

                  deadCodeInjection: false,

                  debugProtection: false,

                  disableConsoleOutput: false,

                  selfDefending: false
                }
              );

            const obfuscatedCode =
              obfuscated.getObfuscatedCode();

            /*
             * Run Terser after obfuscation.
             * This removes unnecessary syntax and
             * produces the final compact output.
             */

            const result =
              await minifyJS(
                obfuscatedCode,
                {
                  compress: true,
                  mangle: false,
                  format: {
                    beautify: false,
                    comments: false,
                    semicolons: true
                  }
                }
              );

            if (
              !result ||
              typeof result.code !== "string"
            ) {
              throw new Error(
                `JavaScript optimization produced no output: ${file}`
              );
            }

            fs.writeFileSync(
              file,
              oneLine(result.code),
              "utf8"
            );
          }

          function processJSON(file) {
            const source =
              fs.readFileSync(
                file,
                "utf8"
              );

            let parsed;

            try {
              parsed =
                JSON.parse(source);
            } catch (error) {
              throw new Error(
                `Invalid JSON in ${relativeFile(file)}: ${error.message}`
              );
            }

            /*
             * JSON.stringify without indentation
             * produces compact valid JSON.
             */

            const output =
              JSON.stringify(
                parsed
              );

            fs.writeFileSync(
              file,
              output,
              "utf8"
            );
          }

          async function main() {
            console.log(
              "=============================================="
            );

            console.log(
              " VIDHWAAN PRODUCTION OPTIMIZATION"
            );

            console.log(
              "=============================================="
            );

            const manifest =
              readManifest();

            walk(WORKSPACE);

            const allFiles = [
              ...htmlFiles,
              ...cssFiles,
              ...jsFiles,
              ...jsonFiles
            ];

            console.log("");
            console.log(
              `HTML files found: ${htmlFiles.length}`
            );

            console.log(
              `CSS files found:  ${cssFiles.length}`
            );

            console.log(
              `JS files found:   ${jsFiles.length}`
            );

            console.log(
              `JSON files found: ${jsonFiles.length}`
            );

            console.log("");

            let processed = 0;
            let skipped = 0;

            for (
              const file of allFiles
            ) {
              const relative =
                relativeFile(file);

              const currentSource =
                fs.readFileSync(
                  file,
                  "utf8"
                );

              const currentHash =
                sha256(
                  currentSource
                );

              const previous =
                manifest.files[
                  relative
                ];

              /*
               * If the exact current file content
               * was already successfully processed,
               * NEVER process it again.
               */

              if (
                previous &&
                previous.sourceHash === currentHash &&
                previous.status === "processed"
              ) {
                console.log(
                  `SKIP  ${relative}`
                );

                skipped++;

                continue;
              }

              const ext =
                path.extname(
                  file
                ).toLowerCase();

              console.log(
                `BUILD ${relative}`
              );

              if (
                ext === ".html" ||
                ext === ".htm"
              ) {
                await processHTML(file);
              } else if (
                ext === ".css"
              ) {
                processCSS(file);
              } else if (
                ext === ".js"
              ) {
                await processJS(file);
              } else if (
                ext === ".json"
              ) {
                processJSON(file);
              }

              const finalSource =
                fs.readFileSync(
                  file,
                  "utf8"
                );

              manifest.files[
                relative
              ] = {
                sourceHash: currentHash,
                outputHash: sha256(
                  finalSource
                ),
                status: "processed",
                type: ext.substring(1)
              };

              processed++;
            }

            /*
             * Remove manifest entries for files
             * that no longer exist.
             */

            const existingFiles =
              new Set(
                allFiles.map(
                  relativeFile
                )
              );

            for (
              const file of Object.keys(
                manifest.files
              )
            ) {
              if (
                !existingFiles.has(file)
              ) {
                delete manifest.files[file];
              }
            }

            manifest.version = 1;

            writeManifest(
              manifest
            );

            console.log("");
            console.log(
              "=============================================="
            );

            console.log(
              " PRODUCTION OPTIMIZATION COMPLETE"
            );

            console.log(
              "=============================================="
            );

            console.log("");
            console.log(
              `Processed: ${processed}`
            );

            console.log(
              `Skipped:   ${skipped}`
            );

            console.log("");
            console.log(
              "✓ Incremental optimization completed."
            );
          }

          main().catch(
            (error) => {
              console.error("");
              console.error(
                "=============================================="
              );

              console.error(
                " BUILD FAILED"
              );

              console.error(
                "=============================================="
              );

              console.error("");

              console.error(
                error
              );

              process.exit(1);
            }
          );
          NODE

          node "$BUILD_DIR/optimize.cjs"

      # ==========================================================
      # 7. VERIFY PRODUCTION FILES
      # ==========================================================

      - name: Verify optimized files
        shell: bash
        run: |
          set -Eeuo pipefail

          FAILED=0

          echo "=============================================="
          echo " VERIFY PRODUCTION FILES"
          echo "=============================================="

          while IFS= read -r -d '' FILE; do

            LINES=$(
              awk 'END {print NR}' "$FILE"
            )

            if [[ "$LINES" -ne 1 ]]; then
              echo "❌ $FILE → $LINES lines"
              FAILED=1
            else
              echo "✓ $FILE"
            fi

          done < <(
            find "$GITHUB_WORKSPACE" \
              -type f \
              \( \
                -name "*.html" \
                -o -name "*.htm" \
                -o -name "*.css" \
                -o -name "*.js" \
                -o -name "*.json" \
              \) \
              ! -path "*/.git/*" \
              ! -path "*/.github/production-manifest.json" \
              ! -path "*/node_modules/*" \
              ! -path "*/.cache/*" \
              ! -path "*/.next/*" \
              ! -path "*/coverage/*" \
              ! -path "*/dist/*" \
              ! -path "*/build/*" \
              ! -path "*/out/*" \
              -print0
          )

          if [[ "$FAILED" -ne 0 ]]; then
            echo ""
            echo "❌ ONE-LINE VERIFICATION FAILED."
            exit 1
          fi

          echo ""
          echo "✓ ALL PRODUCTION HTML/CSS/JS/JSON FILES ARE ONE LINE."

      # ==========================================================
      # 8. VERIFY JSON
      # ==========================================================

      - name: Verify JSON files
        shell: bash
        run: |
          set -Eeuo pipefail

          node <<'NODE'
          const fs = require("fs");
          const path = require("path");

          const root =
            process.env.GITHUB_WORKSPACE;

          const excluded =
            new Set([
              ".git",
              "node_modules",
              ".cache",
              ".next",
              "coverage",
              "dist",
              "build",
              "out"
            ]);

          function walk(dir) {
            for (
              const entry of fs.readdirSync(
                dir,
                { withFileTypes: true }
              )
            ) {
              if (
                entry.isDirectory() &&
                excluded.has(entry.name)
              ) {
                continue;
              }

              const full =
                path.join(
                  dir,
                  entry.name
                );

              if (entry.isDirectory()) {
                walk(full);
                continue;
              }

              if (
                !entry.isFile() ||
                !entry.name
                  .toLowerCase()
                  .endsWith(".json")
              ) {
                continue;
              }

              if (
                entry.name ===
                "production-manifest.json"
              ) {
                continue;
              }

              const source =
                fs.readFileSync(
                  full,
                  "utf8"
                );

              JSON.parse(source);

              const lines =
                source.split("\n").length;

              if (lines !== 1) {
                throw new Error(
                  `${path.relative(root, full)} is not one line.`
                );
              }

              console.log(
                `✓ ${path.relative(root, full)}`
              );
            }
          }

          walk(root);

          console.log("");
          console.log(
            "✓ All JSON files are valid and compressed."
          );
          NODE

      # ==========================================================
      # 9. VERIFY NO UNEXPECTED BUILD FOLDERS
      # ==========================================================

      - name: Verify repository structure
        shell: bash
        run: |
          set -Eeuo pipefail

          if [[ -d "$GITHUB_WORKSPACE/public" ]]; then
            echo "❌ public/ directory must not exist."
            exit 1
          fi

          echo "✓ No public/ directory created."

          if [[ -d "$GITHUB_WORKSPACE/node_modules" ]]; then
            echo "❌ node_modules/ must not exist in repository."
            exit 1
          fi

          echo "✓ No node_modules/ directory."

      # ==========================================================
      # 10. COMMIT ONLY ACTUAL PRODUCTION CHANGES
      #
      # The manifest is also committed so the next run knows
      # which exact file content has already been processed.
      # ==========================================================

      - name: Commit optimized files
        shell: bash
        run: |
          set -Eeuo pipefail

          git config user.name \
            "github-actions[bot]"

          git config user.email \
            "41898282+github-actions[bot]@users.noreply.github.com"

          git add -A

          if git diff --cached --quiet; then
            echo "✓ No changes to commit."
            exit 0
          fi

          git commit \
            -m "chore: optimize production assets"

          git push

      # ==========================================================
      # 11. FINAL SUMMARY
      # ==========================================================

      - name: Build summary
        shell: bash
        run: |
          set -Eeuo pipefail

          echo ""
          echo "=============================================="
          echo " ✓ VIDHWAAN PRODUCTION BUILD PASSED"
          echo "=============================================="
          echo ""

          echo "HTML:"
          echo "  ✓ Minified"
          echo "  ✓ One line"

          echo ""

          echo "CSS:"
          echo "  ✓ Compressed"
          echo "  ✓ One line"

          echo ""

          echo "JavaScript:"
          echo "  ✓ Obfuscated"
          echo "  ✓ Minified"
          echo "  ✓ One line"

          echo ""

          echo "JSON:"
          echo "  ✓ Validated"
          echo "  ✓ Compressed"
          echo "  ✓ One line"

          echo ""

          echo "Other assets:"
          echo "  ✓ Images unchanged"
          echo "  ✓ SVG unchanged"
          echo "  ✓ Fonts unchanged"
          echo "  ✓ PDF unchanged"
          echo "  ✓ Other files unchanged"

          echo ""

          echo "Incremental behavior:"
          echo "  ✓ Already processed files are skipped"
          echo "  ✓ Changed files are processed again"
          echo "  ✓ New files are processed automatically"

          echo ""

          echo "✓ Production optimization completed successfully."
