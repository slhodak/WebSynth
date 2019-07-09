const host = 'http://localhost:3000';

const scripts = [
  `/synthesizer/lib/helpers.js`,
  `/synthesizer/views/templates.js`,
  `/synthesizer/index.js`,
  `/synthesizer/midi.js`
];

let reference = document.getElementsByClassName('scripts')[0];

function addScripts(scripts, reference) {
  scripts.forEach(title => {
    let script = document.createElement('script');
    script.src = host + title;
    document.body.insertBefore(script, reference);
  });
}

addScripts(scripts, reference);