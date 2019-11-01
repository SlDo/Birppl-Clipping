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
                        // Если значение height или width меньше 200 - то подгонять под минимальный размер
                        if((constant || (height*constant)/width) < 200) {
                            constant = 200;
                            this.height = constant;
                            this.width = (width*constant)/height;
                        } else {
                            this.width = constant;
                            this.height = (height*constant)/width;
                        }
                    } else if(width < height) {
                        let constant = document.body.offsetHeight * 0.8;
                        // Если значение height или width меньше 200 - то подгонять под минимальный размер
                        if((constant || (height*constant)/width) < 200) {
                            constant = 200;
                            this.width = constant;
                            this.height = (height*constant)/width;
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
                // Добавление ползунка передвижения фотографии
                if(document.body.offsetWidth < parseInt(img.style.width)) {
                    let move = document.querySelector('.resize__movePhoto');
                    move.style.display = 'block';
                    move.addEventListener('input', function () {
                        img.style.position = 'absolute';
                        img.style.left = `${this.value - 50}px`;
                    });
                }
                // Скрывает поле загрузки
                fileZone.style.display = 'none';
                // Добавляет иконку передвижения
                let resizeCanvas = createElement('canvas');
                resizeCanvas.width = currentImg.width;
                resizeCanvas.height = currentImg.height;
                let context = resizeCanvas.getContext('2d');
                context.drawImage(img, 0, 0, currentImg.width, currentImg.height);
                let resizeZone = document.querySelector('.resize__control');
                resizeZone.style.width = `200px`;
                resizeZone.style.height = `200px`;
                resizeZone.style.display = 'block';
                resizeZone.style.zIndex = 9;
                // Добавляет картинку
                let cropImage = new Image();
                cropImage.src = resizeCanvas.toDataURL();
                img.classList.add('hello');
                resize.style.width = `${currentImg.width}px`;
                resize.style.height = `${currentImg.height}px`;
                resize.appendChild(img);

                function dragAndDrop(elementSelector, dragZone, options) {
                    // options
                    // x: true/false (передвижение по x)
                    // y: true/false (передвижение по y)

                    // Drag&drop для зоны обрезки
                    let objectDragZone = {};
                    let dragElement = document.querySelector(elementSelector); // elementClass
                    dragElement.style.position = 'absolute';

                    dragElement.addEventListener('mousedown', mousedown);
                    dragElement.addEventListener('touchstart', mousedown);

                    function mousedown(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        objectDragZone.mouseX = ((e.pageX - resize.getBoundingClientRect().left)||(e.changedTouches[0].pageX - dragZone.getBoundingClientRect().left)) - dragElement.offsetLeft;
                        objectDragZone.mouseY = ((e.pageY - resize.getBoundingClientRect().top)||(e.changedTouches[0].pageY - dragZone.getBoundingClientRect().top)) - dragElement.offsetTop;
                        objectDragZone.press = true;
                        mousemove(e);

                        function mousemove(e) {

                            let limits = {
                                top: img.offsetTop,
                                left: img.offsetLeft,
                                bottom: img.offsetHeight,
                                right: img.offsetWidth
                            };

                            if(objectDragZone.press) {
                                options.x ? dragElement.style.left = `${((e.pageX - dragZone.getBoundingClientRect().left)||(e.changedTouches[0].pageX - dragZone.getBoundingClientRect().left)) - objectDragZone.mouseX}px` : false;
                                options.y ? dragElement.style.top = `${((e.pageY - dragZone.getBoundingClientRect().top)||(e.changedTouches[0].pageY - dragZone.getBoundingClientRect().top)) - objectDragZone.mouseY}px` : false;
                            }

                            if(dragElement.offsetLeft < limits.left) {
                                dragElement.style.left = `${limits.left}px`;
                            } else if(dragElement.offsetLeft + dragElement.offsetWidth > limits.right) {
                                dragElement.style.left = `${limits.right - dragElement.clientWidth}px`;
                            }

                            if(dragElement.offsetTop < limits.top) {
                                dragElement.style.top = `${limits.top}px`;
                            } else if(dragElement.offsetTop + dragElement.offsetHeight > limits.bottom) {
                                dragElement.style.top = `${limits.bottom - dragElement.clientHeight}px`;
                            }
                        }
                        document.addEventListener('mousemove', mousemove);
                        document.addEventListener('touchmove', mousemove);
                    }

                    function mouseup() {
                        objectDragZone.press = false;
                        document.addEventListener('mouseup', null);
                        dragElement.addEventListener('mouseup', null);
                    }

                    document.addEventListener('mouseup', mouseup);
                    document.addEventListener('touchend', mouseup);

                    dragElement.addEventListener('dragstart', function () {
                        return false;
                    });
                }

                dragAndDrop('.resize__control', resize, {x: true, y: true});

                let newImg = new Image();
                document.querySelector('#crop').addEventListener('click', function () {
                    let x = document.querySelector('.resize__control').getBoundingClientRect().left - resize.getBoundingClientRect().left;
                    let y = document.querySelector('.resize__control').getBoundingClientRect().top - resize.getBoundingClientRect().top;

                    resizeCanvas.width = 200;
                    resizeCanvas.height = 200;
                    context.drawImage(cropImage, x, y, 200, 200, 0, 0, 200, 200);
                    newImg.src = resizeCanvas.toDataURL('jpeg', 1);
                    newImg.style.width = `200px`;
                    newImg.style.height = `200px`;
                    newImg.classList.add('add');
                    resizeZone.style.display = 'none';
                    resize.removeChild(img);
                    resize.appendChild(newImg);
                });
            })
        })
    }
}

fileZone.addEventListener('dragover', function (e) {
    e.preventDefault();
});