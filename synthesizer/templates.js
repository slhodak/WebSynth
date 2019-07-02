const Template = {
  selector(id, name, title, options, optionTitles) {
    let template = 
      `<div class="selector">` +
      `<label for="${name}">${title}: </label>` +
      `<select class="${name}" data-id=${id}>`;
    for (let i = 0; i < options.length; i++) {
      template += `<option name="${options[i]}" value="${options[i]}">${optionTitles ? optionTitles[i] : options[i]}</option>`;
    }
    template += '</select></div>';
    return template;
  },
  slider(id, name, title, min, max, value, step) {
    return (
      `<div class="slider">` +
      `<label for="${name}">${title}: </label>` +
      `<input class="${name}" type="range" min="${min}" max="${max}" value="${value}" step="${step}">` +
      `</div>`
    );
  }
}