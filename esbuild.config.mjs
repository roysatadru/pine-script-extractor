import { build } from 'esbuild';
import fs from 'fs/promises';

// Determine the script mode based on command line arguments
const scriptMode = process.argv[2];

/**
 * @type {import('esbuild').BuildOptions}
 */
const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node14',
  outdir: 'dist',
  define: {
    'process.env.FLUENTFFMPEG_COV': 'false',
  },
  banner: {
    js: `require('source-map-support').install();`,
  },
  sourcemap: true,
  minify: scriptMode === 'build',
};

// Function to clear the dist folder
async function clearDistFolder() {
  if (await fs.stat('dist').catch(() => null)) {
    await fs.rm('dist', { recursive: true });
  }
}

async function runBuild() {
  console.log(`🚀 Running in ${scriptMode} mode`);

  try {
    if (!['build', 'dev'].includes(scriptMode)) {
      throw new Error('Invalid script mode');
    }

    await clearDistFolder();

    const buildMessage = '\n✅ Build completed in';

    if (scriptMode === 'dev') {
      console.log('\n🔥 Building project in watch mode...');
    } else {
      console.time(buildMessage);
      console.log('\n🔥 Building project...');
    }

    await build(config);

    if (scriptMode === 'build') {
      console.timeEnd(buildMessage);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

await runBuild();
console.log('🚀 Ended build process!');
