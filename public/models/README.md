# Face-API.js Models

This directory should contain the pre-trained models for face-api.js. These models are not included in the repository due to their size, but you can download them as follows:

## Required Models

You need to download the following models:

1. `face_landmark_68_model-shard1`
2. `face_landmark_68_model-weights_manifest.json`
3. `face_recognition_model-shard1`
4. `face_recognition_model-shard2`
5. `face_recognition_model-weights_manifest.json`
6. `tiny_face_detector_model-shard1`
7. `tiny_face_detector_model-weights_manifest.json`
8. `face_expression_model-shard1`
9. `face_expression_model-weights_manifest.json`

## Download Instructions

### Option 1: Manual Download

You can manually download these models from the face-api.js GitHub repository:

1. Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download each model file listed above
3. Place all files in this directory (`public/models`)

### Option 2: Download Script

You can use the following Node.js script to download the models:

```javascript
const fs = require('fs');
const path = require('path');
const https = require('https');

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

downloadModels().then(() => {
  console.log('All models downloaded successfully!');
}).catch((err) => {
  console.error('Failed to download models:', err);
});
```

Save this script as `download-models.js` in your project root and run it with Node.js:

```
node download-models.js
```

## Model Information

These models power the ResNet-based facial recognition system used in the Train Security application:

- `tiny_face_detector_model`: Used for fast face detection
- `face_landmark_68_model`: Maps facial landmarks for better recognition
- `face_recognition_model`: The ResNet-based model that extracts face descriptors (embeddings)
- `face_expression_model`: Used for detecting facial expressions (optional enhancement)

Once these models are downloaded to this directory, the facial recognition system will be able to load them at runtime. 