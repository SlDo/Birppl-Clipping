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
                canvas.width = 700;
                canvas.height = 525;
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
                let jpeg = new Image();
                jpeg.src = canvas.toDataURL("image/jpeg", 0.65);
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
                        let information = {};

                        function resize(e) {
                            if (e.which !== 1) {
                                return;
                            }
                            information.cursorX = e.pageX, information.cursorY = e.pageY;
                            information.clamped = true;
                        }
                        document.addEventListener('mouseup', function () {
                            information.clamped = false;
                        });

                        function move(e) {
                            if (information.clamped) {
                                e.currentTarget.style.transform = `translateX(${e.pageX - information.cursorX}px) translateY(${e.pageY - information.cursorY}px)`;
                            }
                            return false;
                        }

                        document.querySelector('#crop').addEventListener('click', function (e) {
                            let x = document.querySelector('.resize__control').getBoundingClientRect().left - document.querySelector('.resize').getBoundingClientRect().left;
                            let y = document.querySelector('.resize__control').getBoundingClientRect().top - document.querySelector('.resize').getBoundingClientRect().top;
                            context.drawImage(jpeg, x, y, 200, 200, 0, 0, 200, 200);
                        });
                        document.querySelector('.resize__control').addEventListener('mousedown', resize);
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