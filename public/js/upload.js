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
                        let constant = document.body.offsetWidth * 0.5;
                        if(document.body.offsetWidth < 768) {
                            constant = document.body.offsetWidth;
                        }
                        this.width = constant;
                        this.height = (height*constant) / width;
                    } else if(width < height) {
                        let constant = document.body.offsetHeight * 0.8;
                        if(document.body.offsetWidth < 768) {
                            this.width = document.body.offsetWidth;
                            this.height = (height*document.body.offsetWidth)/width;
                        } else {
                            this.width = (width*constant)/height;
                            this.height = constant;
                        }
                    } else {
                        this.width = 600;
                        this.height = 600;
                    }
                }

                let currentImg = new ResizeImage(img);
                img.style.width = `${currentImg.width}px`;
                img.style.height = `${currentImg.height}px`;
                // Скрывает поле загрузки
                fileZone.style.display = 'none';
                // Добавляет иконку передвижения
                let resizeZone = document.querySelector('.resize__control');
                resizeZone.style.width = `${currentImg.resizeWidth}px`;
                resizeZone.style.height = `${currentImg.resizeHeight}px`;
                let resizeCanvas = createElement('canvas');
                resizeCanvas.width = currentImg.width;
                resizeCanvas.height = currentImg.height;
                let context = resizeCanvas.getContext('2d');
                context.drawImage(img, 0, 0, currentImg.width, currentImg.height);
                function AdaptiveResizeZone(width, height) {
                    if ((width && height) < 200) {
                        this.resizeHeight = document.body.offsetWidth * 0.5;
                        this.resizeWidth = document.body.offsetWidth * 0.5;
                    } else {
                        this.resizeHeight = 200;
                        this.resizeWidth = 200;
                    }
                }
                let resizeZoneSize = new AdaptiveResizeZone(parseInt(img.style.width), parseInt(img.style.height));
                resizeZone.style.width = `${resizeZoneSize.resizeWidth}px`;
                resizeZone.style.height = `${resizeZoneSize.resizeHeight}px`;
                resizeZone.style.display = 'block';
                resizeZone.style.position = 'absolute';
                // Добавляет картинку
                let cropImage = new Image();
                cropImage.src = resizeCanvas.toDataURL();
                resize.appendChild(img);

                // Drag&drop для зоны обрезки
                let objectResizeZone = {};
                let resizeControl = document.querySelector('.resize__control');
                resizeControl.style.left ='15px';
                resizeControl.style.top = '25px';
                resizeControl.addEventListener('mousedown', mousedown);
                resizeControl.addEventListener('touchstart', mousedown);

                function mousedown(e) {
                    objectResizeZone.mouseX = ((e.pageX - resize.getBoundingClientRect().left)||(e.changedTouches[0].pageX - resize.getBoundingClientRect().left)) - resizeControl.offsetLeft;
                    objectResizeZone.mouseY = ((e.pageY - resize.getBoundingClientRect().top)||(e.changedTouches[0].pageY - resize.getBoundingClientRect().top)) - resizeControl.offsetTop;
                    objectResizeZone.press = true;
                    mousemove(e);

                    function mousemove(e) {

                        let limits = {
                            top: 0,
                            left: 0,
                            bottom: img.offsetHeight,
                            right: img.offsetWidth
                        };

                        if(objectResizeZone.press) {
                            resizeControl.style.left = `${((e.pageX - resize.getBoundingClientRect().left)||(e.changedTouches[0].pageX - resize.getBoundingClientRect().left)) - objectResizeZone.mouseX}px`;
                            resizeControl.style.top = `${((e.pageY - resize.getBoundingClientRect().top)||(e.changedTouches[0].pageY - resize.getBoundingClientRect().top)) - objectResizeZone.mouseY}px`;
                        }

                        if(resizeControl.offsetLeft < limits.left) {
                            resizeControl.style.left = `${limits.left}px`;
                        } else if(resizeControl.offsetLeft + resizeControl.offsetWidth > limits.right) {
                            resizeControl.style.left = `${limits.right - resizeControl.clientWidth}px`;
                        }

                        if(resizeControl.offsetTop < limits.top) {
                            resizeControl.style.top = `${limits.top}px`;
                        } else if(resizeControl.offsetTop + resizeControl.offsetHeight > limits.bottom) {
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
                let newImg = new Image();
                document.querySelector('#crop').addEventListener('click', function () {
                    let x = document.querySelector('.resize__control').getBoundingClientRect().left - resize.getBoundingClientRect().left;
                    let y = document.querySelector('.resize__control').getBoundingClientRect().top - resize.getBoundingClientRect().top;

                    resizeCanvas.width = 200;
                    resizeCanvas.height = 200;
                    context.drawImage(cropImage, x, y, 200, 200, 0, 0, 200, 200);
                    newImg.src = resizeCanvas.toDataURL('jpeg', 1);
                    newImg.style.zIndex = 1080;
                    newImg.classList.add('add');
                    // resize.appendChild(newImg);
                });
            })
        })
    }
}

fileZone.addEventListener('dragover', function (e) {
    e.preventDefault();
});