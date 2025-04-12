import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get current directory in ES modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = './public/models';
const modelsToDownload = [
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_recognition_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'tiny_face_detector_model-weights_manifest.json',
  'face_expression_model-shard1',
  'face_expression_model-weights_manifest.json'
];

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Download models
async function downloadModels() {
  for (const model of modelsToDownload) {
    const url = `https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/${model}`;
    const filePath = path.join(modelsDir, model);
    
    console.log(`Downloading ${model}...`);
    
    await new Promise((resolve, reject) => {
      https.get(url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${model}`);
            resolve();
          });
        } else {
          console.error(`Failed to download ${model}: ${response.statusCode}`);
          reject();
        }
      }).on('error', (err) => {
        console.error(`Failed to download ${model}: ${err.message}`);
        reject(err);
      });
    });
  }
}

console.log('Starting download of face-api.js models...');
downloadModels().then(() => {
  console.log('All models downloaded successfully!');
}).catch((err) => {
  console.error('Failed to download models:', err);
}); 