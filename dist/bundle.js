const host = 'http://localhost:3000';

const scripts = [
  '/synthesizer/lib/preset.js',
  '/synthesizer/lib/helpers.js',
  '/synthesizer/controllers/controllers.js',
  '/synthesizer/views/views.js',
  '/synthesizer/views/templates.js',
  '/synthesizer/main.js',
  '/synthesizer/midi.js'
];

let reference = document.getElementsByClassName('scripts')[0];

function addScripts(scripts, reference) {
  scripts.forEach((title, index) => {
    let script = document.createElement('script');
    script.src = host + title;
    script.type = "module"
    document.body.insertBefore(script, reference);
  });
}

addScripts(scripts, reference);