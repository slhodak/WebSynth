const host = 'http://localhost:3000';

const scripts = [
  '/synthesizer/lib/helpers.js',
  '/synthesizer/lib/preset.js',
  '/synthesizer/views/templates.js',
  '/synthesizer/index.js',
  '/synthesizer/midi.js'
];

let reference = document.getElementsByClassName('scripts')[0];

function addScripts(scripts, reference) {
  scripts.forEach((title, index) => {
    let script = document.createElement('script');
    script.src = host + title;
    if (index = scripts.length - 1) {
      script.type = "module"
    }
    document.body.insertBefore(script, reference);
  });
}

addScripts(scripts, reference);