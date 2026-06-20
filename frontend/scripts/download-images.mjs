import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define Unsplash image IDs and their configurations
const imagesToDownload = [
  { filename: "hero.jpg", id: "1610030469983-98e550d6193c", width: 1920, quality: 80 },
  { filename: "collection-banner.jpg", id: "1583391733956-3750e0ff4e8b", width: 1200, quality: 80 },
  { filename: "product-1.jpg", id: "1610030469983-98e550d6193c", width: 800, quality: 80 },
  { filename: "product-2.jpg", id: "1610030470298-316279f6fa18", width: 800, quality: 80 },
  { filename: "product-3.jpg", id: "1617627143750-d86bc21e42bb", width: 800, quality: 80 },
  { filename: "product-4.jpg", id: "1610030469668-8e4a7c3f2a0a", width: 800, quality: 80 },
  { filename: "saree-base-1.jpg", id: "1610030469983-98e550d6193c", width: 800, quality: 80 },
  { filename: "saree-base-2.jpg", id: "1583391733956-3750e0ff4e8b", width: 800, quality: 80 },
  { filename: "saree-base-3.jpg", id: "1583391265517-35bbdba01229", width: 800, quality: 80 },
  { filename: "saree-base-4.jpg", id: "1610030470298-316279f6fa18", width: 800, quality: 80 },
  { filename: "saree-base-5.jpg", id: "1617627143750-d86bc21e42bb", width: 800, quality: 80 },
  { filename: "saree-base-6.jpg", id: "1610030469668-8e4a7c3f2a0a", width: 800, quality: 80 },
  { filename: "saree-base-7.jpg", id: "1693987646306-10e4670fea01", width: 800, quality: 80 },
];

const destDirs = [path.join(__dirname, "../src/assets"), path.join(__dirname, "../public/assets")];

// Ensure directories exist
destDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image. Status code: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlinkSync(destPath);
        reject(err);
      });
  });
}

async function run() {
  console.log("Starting download of high-quality saree images...");
  for (const img of imagesToDownload) {
    const url = `https://images.unsplash.com/photo-${img.id}?auto=format&fit=crop&w=${img.width}&q=${img.quality}`;
    console.log(`Downloading ${img.filename}...`);

    // Download to first directory
    const firstDest = path.join(destDirs[0], img.filename);
    try {
      await downloadImage(url, firstDest);
      console.log(`Successfully downloaded ${img.filename} to ${destDirs[0]}`);

      // Copy to other directories
      for (let i = 1; i < destDirs.length; i++) {
        const dest = path.join(destDirs[i], img.filename);
        fs.copyFileSync(firstDest, dest);
        console.log(`Copied ${img.filename} to ${destDirs[i]}`);
      }
    } catch (error) {
      console.error(`Error downloading ${img.filename}:`, error.message);
    }
  }
  console.log("All image downloads completed successfully!");
}

run();
