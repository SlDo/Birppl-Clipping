const fileInput = document.querySelector('#file');
const submit = document.querySelector('#submit');

submit.addEventListener('click', function () {
    let files = fileInput.files;
    for(let i = 0; i < files.length; i++) {
        let img = new Image();
        let reader = new FileReader();
        reader.readAsDataURL(files[i]);
        reader.addEventListener('load', function (e) {
            img.src = e.target.result;
            img.addEventListener('load', function () {
                let progress = document.querySelector('#progress');
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                let jpeg = canvas.toDataURL("image/jpeg", 0.65);

                let xhr = new XMLHttpRequest();
                let upload = new FormData();
                upload.append('img', jpeg);
                xhr.open("POST", '/upload', true);
                xhr.upload.onprogress = function(event) {
                    progress.setAttribute('max', event.total);
                    progress.value = event.loaded;
                };
                xhr.onreadystatechange = function () {
                    if(xhr.readyState === 4 && xhr.status === 200) {
                        let res = this.responseText;
                        let jpg = new Image();
                        jpg.src = res;
                        jpg.style.width = '100%';
                        jpg.style.height = '100%';
                        jpg.style.borderRadius = '5px';
                        function createElem(tagElem, classElem) {
                            try {
                                if(!Array.isArray(classElem)) {
                                    throw new Error()
                                }
                                let newElem = document.createElement(tagElem);
                                newElem.classList.add(...classElem);
                                return newElem;
                            } catch (e) {
                                console.error('Переданный аргумент не является массивом')
                            }
                        }

                        let information = {};

                        function resize(e) {
                            if (e.which !== 1) {
                                return;
                            }
                            information.cursorX = e.pageX, information.cursorY = e.pageY;
                            information.clamped = true;
                        }

                        document.querySelector('.resize__control').addEventListener('mousedown', resize);
                        document.addEventListener('mouseup', function () {
                            information.clamped = false;
                        });

                        function move(e) {
                            if (information.clamped) {
                                information.x = this.getBoundingClientRect().x, information.y = this.getBoundingClientRect().y;
                                e.currentTarget.style.transform = `translateX(${e.pageX - information.cursorX}px) translateY(${e.pageY - information.cursorY}px)`;
                                document.querySelector('#crop').addEventListener('click', function () {
                                    context.clearRect(0, 0, canvas.width, canvas.height);
                                    // context.drawImage(img, information.x, information.y)
                                    context.drawImage(img, 90,130,50,60,10,10,200,200);
                                });
                            }
                            return false;
                        }
                        document.querySelector('.resize__control').addEventListener('mousemove', move);
                    }
                };
                xhr.send(upload);
                reader.abort()
            });
        });
    }
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
});