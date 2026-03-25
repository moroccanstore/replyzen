import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import archiver from 'archiver';
import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

const R2_CONFIG = {
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
};

async function buildAndUpload() {
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist_package');
  const zipPath = path.join(rootDir, 'autowhats.zip');

  try {
    console.log('🚀 Starting Production Build & Upload...');

    // 1. Clean previous builds
    await fs.remove(distDir);
    await fs.remove(zipPath);
    await fs.ensureDir(distDir);

    // 2. Run Builds
    console.log('📦 Running npm build...');
    execSync('npm run build', { stdio: 'inherit' });

    // 3. Prepare Package Directory (Only production files)
    console.log('📂 Preparing package directory...');
    
    // Copy Backend dist
    await fs.copy(path.join(rootDir, 'apps/api/dist'), path.join(distDir, 'apps/api/dist'));
    // Copy Frontend build
    await fs.copy(path.join(rootDir, 'apps/web/.next'), path.join(distDir, 'apps/web/.next'));
    await fs.copy(path.join(rootDir, 'apps/web/public'), path.join(distDir, 'apps/web/public'));
    
    // Copy Shared files
    await fs.copy(path.join(rootDir, 'package.json'), path.join(distDir, 'package.json'));
    await fs.copy(path.join(rootDir, 'ecosystem.config.js'), path.join(distDir, 'ecosystem.config.js'));
    await fs.copy(path.join(rootDir, 'apps/api/prisma'), path.join(distDir, 'apps/api/prisma'));

    // 4. Create ZIP
    console.log('🤐 Creating ZIP archive...');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(distDir, false);
      archive.finalize();
    });

    console.log(`📦 ZIP created at: ${zipPath} (${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(2)} MB)`);

    // 5. Upload to R2
    console.log('☁️ Uploading to Cloudflare R2...');
    const s3 = new S3Client({
      region: 'auto',
      endpoint: R2_CONFIG.endpoint,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId!,
        secretAccessKey: R2_CONFIG.secretAccessKey!,
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: 'autowhats.zip',
        Body: fs.createReadStream(zipPath),
      })
    );

    console.log('✅ Successfully uploaded autowhats.zip to R2!');
    
    // Cleanup
    await fs.remove(distDir);
    console.log('🧹 Cleanup complete.');

  } catch (error) {
    console.error('❌ Build and Upload failed:', error);
    process.exit(1);
  }
}

buildAndUpload();
