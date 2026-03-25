// Merges silent demo video with background music
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path   = require('path');

const video  = path.join(__dirname, 'demo-assets', 'video', 'FridgeIQ-demo-silent.webm');
const music  = path.join(__dirname, 'demo-assets', 'background-music.wav');
const output = path.join(__dirname, 'demo-assets', 'video', 'FridgeIQ-demo-walkthrough.webm');

console.log('Merging video + music...');
execFileSync(ffmpeg, [
  '-y',
  '-i', video,
  '-i', music,
  '-filter_complex', '[1:a]volume=0.25[a]',   // music at 25% volume
  '-map', '0:v',
  '-map', '[a]',
  '-shortest',
  '-c:v', 'copy',
  '-c:a', 'libvorbis',
  '-b:a', '128k',
  output,
], { stdio: 'inherit' });

console.log('\nSaved:', output);
