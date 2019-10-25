// Создание элемента
export function createElement(tag, options = {}) {
    if(typeof options !== 'object') {
        return;
    }
    let element = document.createElement(tag);
    if(options.classList) {
        options.classList.forEach((classes) => {
            element.classList.add(classes);
        });
    }
    if(options.style) {
        for(let key in options.style) {
            element.style[key] = options.style[key];
        }
    }
    return element;
}