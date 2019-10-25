import {createElement} from "./modules/birppl-dom.js";

let fileInput = document.querySelector('#input__file');
let fileZone = document.querySelector('.input__file');
let resize = document.querySelector('.resize');

fileZone.addEventListener('drop', photoUpload);
fileInput.addEventListener('change', photoUpload);

function photoUpload(e) {
    e.preventDefault();
    e.stopPropagation();

    let filesUpload = (fileInput.files || e.dataTransfer.files);
    for(let i = 0; i < filesUpload.length; i++) {
        let img = new Image();
        let reader = new FileReader();

        reader.readAsDataURL(filesUpload[0]);

        reader.addEventListener('load', function (e) {
            img.src = e.target.result;
            img.addEventListener('load', function () {
                // Функиция пропорционального ресайза изображения
                function ResizeImage(img) {
                    const width = img.width;
                    const height = img.height;

                    if(width > height) {
                        let constant = 600;
                        this.width = constant;
                        this.height = (height*constant) / width;
                    } else if(width < height) {
                        let constant = 600;
                        this.width = (width*constant)/height;
                        this.height = constant;
                    } else {
                        this.width = 800;
                        this.height = 800;
                    }
                }

                let currentImg = new ResizeImage(img);
                img.style.width = `${currentImg.width}px`;
                img.style.height = `${currentImg.height}px`;
                // Скрывает поле загрузки
                fileZone.style.display = 'none';
                // Добавляет иконку передвижения
                let resizeZone = createElement('div', {classList: ['resize__control'], style: {position: 'absolute'}});
                let resizeCanvas = createElement('canvas');
                resizeCanvas.width = currentImg.width;
                resizeCanvas.height = currentImg.height;
                let context = resizeCanvas.getContext('2d');
                context.drawImage(img, 0, 0, currentImg.width, currentImg.height);
                resize.appendChild(resizeZone);
                // Добавляет картинку
                let jpeg = new Image();
                jpeg.src = resizeCanvas.toDataURL('image/jpeg', 0.75);
                resize.appendChild(img);

                // Drag&drop для зоны обрезки
                let objectResizeZone = {};
                let resizeControl = document.querySelector('.resize__control');

                resizeControl.addEventListener('mousedown', mousedown);
                resizeControl.addEventListener('touchstart', mousedown);

                function mousedown(e) {
                    objectResizeZone.mouseX = (e.pageX || e.changedTouches[0].pageX) - resizeControl.getBoundingClientRect().left;
                    objectResizeZone.mouseY = (e.pageY || e.changedTouches[0].pageY) - resizeControl.getBoundingClientRect().top;
                    objectResizeZone.press = true;
                    mousemove(e);

                    function mousemove(e) {

                        let limits = {
                            top: img.getBoundingClientRect().top,
                            left: img.getBoundingClientRect().left,
                            bottom: img.getBoundingClientRect().bottom,
                            right: img.getBoundingClientRect().right
                        };

                        if(objectResizeZone.press) {
                            resizeControl.style.left = `${(e.pageX || e.changedTouches[0].pageX) - objectResizeZone.mouseX}px`;
                            resizeControl.style.top = `${(e.pageY || e.changedTouches[0].pageY) - objectResizeZone.mouseY}px`;
                        }

                        if(resizeControl.getBoundingClientRect().left < limits.left) {
                            resizeControl.style.left = `${limits.left}px`;
                        } else if(resizeControl.getBoundingClientRect().right > limits.right) {
                            resizeControl.style.left = `${limits.right - resizeControl.clientWidth}px`;
                        }

                        if(resizeControl.getBoundingClientRect().top < limits.top) {
                            resizeControl.style.top = `${limits.top}px`;
                        } else if(resizeControl.getBoundingClientRect().bottom > limits.bottom) {
                            resizeControl.style.top = `${limits.bottom - resizeControl.clientHeight}px`;
                        }
                    }
                    document.addEventListener('mousemove', mousemove);
                    document.addEventListener('touchmove', mousemove);
                }

                function mouseup() {
                    objectResizeZone.press = false;
                    document.addEventListener('mouseup', null);
                    resizeControl.addEventListener('mouseup', null);
                }

                document.addEventListener('mouseup', mouseup);
                document.addEventListener('touchend', mouseup);

                resizeControl.addEventListener('dragstart', function () {
                    return false;
                });

                document.querySelector('#crop').addEventListener('click', function () {
                    let x = document.querySelector('.resize__control').getBoundingClientRect().left - resize.getBoundingClientRect().left;
                    let y = document.querySelector('.resize__control').getBoundingClientRect().top - resize.getBoundingClientRect().top;

                    resizeCanvas.width = parseInt(img.style.width);
                    resizeCanvas.height = parseInt(img.style.height);
                    context.drawImage(jpeg, x, y, 200, 200, 0, 0, 200, 200);
                    resize.appendChild(resizeCanvas);
                })
            })
        })
    }
}

fileZone.addEventListener('dragover', function (e) {
    e.preventDefault();
});