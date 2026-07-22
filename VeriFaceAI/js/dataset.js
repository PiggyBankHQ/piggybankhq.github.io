/* ========================================================
   DYNAMIC AUTOMATIC IMAGE DIRECTORY SCANNER & SAMPLER
   Alternating gender rule:
   - Odd numbers (1, 3, 5...) -> .F.png
   - Even numbers (2, 4, 6...) -> .M.png
   ======================================================== */

let realImagePool = [];
let aiImagePool = [];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Scans a folder for files matching prefix_xxx.[F|M].png (1 to 999)
 */
async function scanFolderForAlternatingImages(folderPath, prefix) {
  const discoveredImages = [];
  const probePromises = [];

  for (let i = 1; i <= 999; i++) {
    const gender = (i % 2 === 1) ? 'F' : 'M';
    const numStr = String(i);
    const numPaddedTwo = numStr.padStart(2, '0');
    const numPaddedThree = numStr.padStart(3, '0');

    const numVariants = Array.from(new Set([numStr, numPaddedTwo, numPaddedThree]));

    numVariants.forEach(num => {
      const url = `${folderPath}/${prefix}_${num}.${gender}.png`;
      
      probePromises.push(
        new Promise(resolve => {
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = () => resolve(null);
          img.src = url;
        })
      );
    });
  }

  const results = await Promise.all(probePromises);
  results.forEach(url => {
    if (url && !discoveredImages.includes(url)) {
      discoveredImages.push(url);
    }
  });

  return discoveredImages;
}

// Fallback base dataset for training
let trainingDataset = [
  {
    id: 1,
    isAI: true,
    img: "images/AI/ai_1.F.png",
    fallbackSvg: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' viewBox='0 0 1024 1024'><rect width='1024' height='1024' fill='%23e0e7ff'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' font-weight='bold' fill='%234338ca'>AI Training Subject</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%236366f1'>(images/AI/ai_1.F.png)</text></svg>",
    reason: "Notice the irregular pupil reflections and the background blurring that bleeds unnaturally into the ear outline."
  },
  {
    id: 2,
    isAI: false,
    img: "images/real/real_2.M.png",
    fallbackSvg: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' viewBox='0 0 1024 1024'><rect width='1024' height='1024' fill='%23d1fae5'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' font-weight='bold' fill='%23065f46'>Real Training Subject</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2310b981'>(images/real/real_2.M.png)</text></svg>",
    reason: "Natural skin pore distribution, symmetric glasses, and realistic light reflection across both eyes."
  }
];

/**
 * Initializes image pools on boot and populates training module from discovered pools
 */
async function initializeImagePools() {
  realImagePool = await scanFolderForAlternatingImages('images/real', 'real');
  aiImagePool = await scanFolderForAlternatingImages('images/AI', 'ai');

  if (realImagePool.length === 0) {
    realImagePool = Array.from({ length: 10 }, (_, i) => {
      const num = i + 1;
      const gender = (num % 2 === 1) ? 'F' : 'M';
      return `images/real/real_${num}.${gender}.png`;
    });
  }
  if (aiImagePool.length === 0) {
    aiImagePool = Array.from({ length: 10 }, (_, i) => {
      const num = i + 1;
      const gender = (num % 2 === 1) ? 'F' : 'M';
      return `images/AI/ai_${num}.${gender}.png`;
    });
  }

  // Bind real discovered images to training suite if available
  if (aiImagePool[0]) trainingDataset[0].img = aiImagePool[0];
  if (realImagePool[0]) trainingDataset[1].img = realImagePool[0];
}

/**
 * Generates 20-item balanced quiz dataset
 */
function generateQuizDataset() {
  const totalCount = 20;
  const countPerCategory = totalCount / 2;

  const shuffledReal = shuffleArray(realImagePool);
  const selectedReal = shuffledReal.slice(0, countPerCategory).map(path => {
    const filename = path.split('/').pop();
    return {
      isAI: false,
      img: path,
      fallbackSvg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' viewBox='0 0 1024 1024'><rect width='1024' height='1024' fill='%23d1fae5'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' font-weight='bold' fill='%23065f46'>Real Human Face</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2310b981'>(${filename})</text></svg>`
    };
  });

  const shuffledAI = shuffleArray(aiImagePool);
  const selectedAI = shuffledAI.slice(0, countPerCategory).map(path => {
    const filename = path.split('/').pop();
    return {
      isAI: true,
      img: path,
      fallbackSvg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' viewBox='0 0 1024 1024'><rect width='1024' height='1024' fill='%23e0e7ff'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' font-weight='bold' fill='%234338ca'>AI Synthetic Face</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%236366f1'>(${filename})</text></svg>`
    };
  });

  const combined = shuffleArray([...selectedReal, ...selectedAI]);

  return combined.map((item, index) => ({
    id: index + 1,
    ...item
  }));
}

let quizDataset = [];