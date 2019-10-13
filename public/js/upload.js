const fileInput = document.querySelector('#input__file');
const fileZone = document.querySelector('.input__file');
let resizeElem = document.querySelector('.resize');
let svg = document.querySelectorAll('.input__file__svg');
let crop = document.querySelector('#crop');
let newPhoto = document.querySelector('#new');


fileZone.addEventListener('drop', photoUpload);
fileInput.addEventListener('change', photoUpload);
function photoUpload(e) {
    e.preventDefault();
    let files;
    if(e.type === 'change') {
        files = fileInput.files;
    } else {
        files = e.dataTransfer.files;
    }
    for(let i = 0; i < files.length; i++) {
        let img = new Image();
        let reader = new FileReader();
        reader.readAsDataURL(files[i]);
        reader.addEventListener('load', function (e) {
            fileZone.style.display = 'none';
            resizeElem.style.display = 'flex';
            crop.style.display = 'inline-block';
            newPhoto.style.display = 'inline-block';
            svg.forEach(function (value, i) {
                if (i > 0) {
                    value.classList.add('svg__success');
                }
            });
            img.src = e.target.result;
            img.addEventListener('load', function () {
                if(document.querySelector('.resize__control')) {
                    resizeElem.removeChild(document.querySelector('.resize__control'));
                }
                let resizeC = document.createElement('DIV');
                resizeC.classList.add('resize__control');
                resizeC.style.position = 'absolute';
                resizeElem.appendChild(resizeC);

                newPhoto.addEventListener('click', function() {
                    fileZone.style.display = 'flex';
                    resizeElem.style.display = 'none';
                    crop.style.display = 'none';
                    newPhoto.style.display = 'none';
                    context.clearRect(0, 0, canvas.width, canvas.height);
                });

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
                canvas.width = currentImg.width;
                canvas.height = currentImg.height;
                context.drawImage(img, 0, 0, canvas.width, canvas.height);

                let jpeg = new Image();
                jpeg.src = canvas.toDataURL("image/jpeg", 0.85);
                let xhr = new XMLHttpRequest();
                let upload = new FormData();
                xhr.open("POST", '/upload', true);

                let object = {};
                let resizeControl = document.querySelector('.resize__control');

                resizeControl.addEventListener('mousedown', mousedown);
                resizeControl.addEventListener('touchstart', mousedown);

                function mousedown(e) {
                    object.mouseX = (e.pageX || e.changedTouches[0].pageX) - resizeControl.getBoundingClientRect().left;
                    object.mouseY = (e.pageY || e.changedTouches[0].pageY) - resizeControl.getBoundingClientRect().top;
                    object.press = true;
                    mousemove(e);

                    function mousemove(e) {

                        let limits = {
                            top: resizeElem.getBoundingClientRect().top,
                            left: resizeElem.getBoundingClientRect().left,
                            bottom: resizeElem.getBoundingClientRect().bottom,
                            right: resizeElem.getBoundingClientRect().right
                        };

                        if(object.press) {
                            resizeControl.style.left = `${(e.pageX || e.changedTouches[0].pageX) - object.mouseX}px`;
                            resizeControl.style.top = `${(e.pageY || e.changedTouches[0].pageY) - object.mouseY}px`;
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
                    object.press = false;
                    document.addEventListener('mouseup', null);
                    resizeControl.addEventListener('mouseup', null);
                }

                document.addEventListener('mouseup', mouseup);
                document.addEventListener('touchend', mouseup);

                resizeControl.addEventListener('dragstart', function () {
                    return false;
                });

                document.querySelector('#crop').addEventListener('click', function (e) {
                    let x = document.querySelector('.resize__control').getBoundingClientRect().left - document.querySelector('.resize').getBoundingClientRect().left;
                    let y = document.querySelector('.resize__control').getBoundingClientRect().top - document.querySelector('.resize').getBoundingClientRect().top;
                    context.drawImage(jpeg, x, y, 200, 200, 0, 0, 200, 200);
                });


                // xhr.onreadystatechange = function () {
                //     if(xhr.readyState === 4 && xhr.status === 200) {
                //     }
                // };

                xhr.send(upload);
                reader.abort();
            });
        });
    }
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
}

fileZone.addEventListener('dragover', function (e) {
    e.preventDefault();
});