import {createElement} from "./modules/birppl-dom.js";
import {dragAndDrop} from "./modules/dragdrop.js";

let fileInput = document.querySelector('#input__file');
let fileZone = document.querySelector('.input__file');
let resize = document.querySelector('.crop__zone');
let previewText = document.querySelector('.preview__text');

fileZone.addEventListener('drop', photoUpload);
fileInput.addEventListener('change', photoUpload);

function photoUpload(e) {
    e.preventDefault();
    e.stopPropagation();

    resize.style.display = 'flex';

    let filesUpload = (e.target.files || e.dataTransfer.files);
    for(let i = 0; i < filesUpload.length; i++) {
        let reader = new FileReader();

        reader.readAsDataURL(filesUpload[0]);
        reader.addEventListener('load', function (e) {
            let img = new Image();
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
                        if(constant < 200 || (height*constant)/width < 200) {
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
                        if((constant < 200 || height*constant)/width < 200) {
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

                // Добавляет кнопки
                let controlBtn = document.querySelector('.control__btn');
                let btnPrevUpload = document.querySelector('#prevUpload');
                let btnPrevCrop = document.querySelector('#prevCrop');
                let btnCrop = document.querySelector('#crop');
                let btnSuccess = document.querySelector('#success');
                controlBtn.style.display = 'grid';
                btnPrevUpload.style.display = 'block';

                let currentImg = new ResizeImage(img);
                img.style.width = `${currentImg.width}px`;
                img.style.height = `${currentImg.height}px`;
                // Добавление ползунка передвижения фотографии
                let move = document.querySelector('.crop__movePhoto');
                function conditionsMove() {
                    if(document.body.offsetWidth < parseInt(img.style.width)) {
                        move.style.display = 'block';
                        move.addEventListener('input', function () {
                            img.style.position = 'absolute';
                            img.style.left = `${(this.value - 50)*2}px`;
                        });
                    }
                }
                conditionsMove();
                // Скрывает поле загрузки
                fileZone.style.display = 'none';
                // Добавляет иконку передвижения
                let resizeCanvas = createElement('canvas');
                resizeCanvas.width = currentImg.width;
                resizeCanvas.height = currentImg.height;
                resize.style.width = `${currentImg.width}px`;
                resize.style.height = `${currentImg.height}px`;
                let context = resizeCanvas.getContext('2d');
                context.drawImage(img, 0, 0, currentImg.width, currentImg.height);

                let resizeCreate = createElement('div', {classList: ['resize__control'], style: {width: '200px', height: '200px', display: 'block', zIndex: 9}})
                resize.appendChild(resizeCreate);
                // Добавляет картинку
                img.classList.add('hello');
                resize.appendChild(img);

                function uploadPrev() {
                    img.remove();
                    resizeCanvas = null;
                    resizeCreate.remove();
                    move.style.display = 'none';

                    controlBtn.style.display = 'none';
                    btnPrevUpload.style.display = 'none';
                    resize.style.display = 'block';
                    fileZone.style.display = 'flex';
                }

                document.querySelector('#prevUpload').addEventListener('click', uploadPrev);

                // Добавляет кнопку "обрезка"
                btnCrop.style.display = 'block';

                dragAndDrop('.resize__control', resize, {x: true, y: true, limit: img});
                let cropImage = new Image();
                cropImage.src = resizeCanvas.toDataURL('jpeg', 1);
                document.querySelector('#crop').addEventListener('click', function () {
                    let newImg = new Image();

                    let x = document.querySelector('.resize__control').getBoundingClientRect().left - resize.getBoundingClientRect().left;
                    let y = document.querySelector('.resize__control').getBoundingClientRect().top - resize.getBoundingClientRect().top;
                    btnPrevUpload.style.display = 'none';
                    btnPrevCrop.style.display = 'block';
                    move.style.display = 'none';
                    previewText.style.display = 'inline';

                    resizeCanvas.width = 200;
                    resizeCanvas.height = 200;
                    context.drawImage(cropImage, x, y, 200, 200, 0, 0, 200, 200);
                    newImg.src = resizeCanvas.toDataURL('jpeg', 1);
                    newImg.style.width = `200px`;
                    newImg.style.height = `200px`;
                    newImg.classList.add('add');
                    resize.style.width = 'auto';
                    resize.style.height = 'auto';
                    resizeCreate.style.display = 'none';
                    img.style.display = 'none';
                    resize.appendChild(newImg);

                    function cropPrev() {
                        newImg.remove();
                        previewText.style.display = 'none';

                        resize.style.width = `${currentImg.width}px`;
                        resize.style.height = `${currentImg.height}px`;

                        resizeCreate.style.display = 'block';
                        img.style.display = 'block';
                        btnCrop.style.display = 'block';
                        btnSuccess.style.display = 'none';
                        btnPrevCrop.style.display = 'none';
                        btnPrevUpload.style.display = 'block';
                        conditionsMove();
                    }

                    document.querySelector('#prevCrop').addEventListener('click', cropPrev);

                    btnSuccess.addEventListener('click', function () {
                        fetch('/upload', {
                           method: 'POST',
                           headers: {'Content-type': 'multipart/form-data'},
                           body: resizeCanvas.toDataURL('jpeg', 1)
                       }).then((res) => {
                           console.log(res);
                       })
                    });

                    btnCrop.style.display = 'none';
                    btnSuccess.style.display = 'block';
                });
            })
        })
    }
}

fileZone.addEventListener('dragover', function (e) {
    e.preventDefault();
});