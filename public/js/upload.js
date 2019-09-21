const fileInput = document.querySelector('#file');
const submit = document.querySelector('#submit');
let progress = document.querySelector('#progress');
let resizeElem = document.querySelector('.resize');

submit.addEventListener('click', function () {
    let files = fileInput.files;
    for(let i = 0; i < files.length; i++) {
        let img = new Image();
        let reader = new FileReader();
        reader.readAsDataURL(files[i]);
        reader.addEventListener('load', function (e) {
            img.src = e.target.result;
            img.addEventListener('load', function () {
                canvas.width = resizeElem.clientWidth;
                canvas.height = resizeElem.clientHeight;
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
                let jpeg = new Image();
                jpeg.src = canvas.toDataURL("image/jpeg", 0.85);
                let xhr = new XMLHttpRequest();
                let upload = new FormData();
                xhr.open("POST", '/upload', true);
                xhr.upload.onprogress = function(event) {
                    progress.setAttribute('max', event.total);
                    progress.value = event.loaded;
                };

                let resizeControl = document.querySelector('.resize__control');
                function resize(e) {
                    let x = e.pageX - resizeControl.getBoundingClientRect().left;
                    let y = e.pageY - resizeControl.getBoundingClientRect().top;
                    let clamped = true;
                    document.body.appendChild(resizeControl);

                    document.addEventListener('mousemove', function(e) {
                        if (clamped) {
                            resizeControl.style.left = e.pageX - x + 'px';
                            resizeControl.style.top = e.pageY - y + 'px';
                        }
                    });
                    document.addEventListener('mouseup', function () {
                        clamped = false;
                        document.onmousemove = null;
                        resizeControl.onmouseup = null;
                    });
                };
                document.querySelector('.resize__control').addEventListener('mousedown', resize);

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
});