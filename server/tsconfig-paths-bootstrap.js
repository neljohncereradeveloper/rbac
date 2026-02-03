'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfigPaths = require('tsconfig-paths');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('./tsconfig.json');
const path = require('path');

/**
 * Register TypeScript path aliases for runtime resolution
 * This allows the use of path aliases like @/core and @/features in runtime
 *
 * Automatically detects whether running TypeScript source (with ts-node) or compiled JavaScript:
 * - TypeScript source: maps paths to src/ (for ts-node execution)
 * - Compiled JavaScript: maps paths to dist/ (for node execution)
 */
const baseUrl = path.resolve(__dirname);
const sourcePaths = tsConfig.compilerOptions.paths || {};

// Detect if we're running TypeScript source (ts-node) or compiled JavaScript
// Check if the main entry file is .ts (TypeScript) or .js (compiled)
const mainModule = require.main?.filename || '';
const isTypeScript =
  mainModule.endsWith('.ts') || process.argv.some((arg) => arg.endsWith('.ts'));

// Determine the source directory based on execution context
const sourceDir = isTypeScript ? 'src' : 'dist';

// Map paths from src/ to the appropriate directory
const runtimePaths = {};
for (const [alias, sourcePathsArray] of Object.entries(sourcePaths)) {
  runtimePaths[alias] = sourcePathsArray.map((sourcePath) =>
    sourcePath.replace(/^src\//, `${sourceDir}/`),
  );
}

tsConfigPaths.register({
  baseUrl,
  paths: runtimePaths,
});
