export function dragAndDrop(elementSelector, dragZone, options) {
    // options
    // x: true/false (передвижение по x)
    // y: true/false (передвижение по y)
    // limit: element (элемент, который станет границой)

    // Drag&drop для зоны обрезки
    let objectDragZone = {};
    let dragElement = document.querySelector(elementSelector); // elementClass
    dragElement.style.position = 'absolute';

    dragElement.addEventListener('mousedown', mousedown);
    dragElement.addEventListener('touchstart', mousedown);

    function mousedown(e) {
        e.preventDefault();
        e.stopPropagation();
        objectDragZone.mouseX = ((e.pageX - e.target.parentElement.getBoundingClientRect().left)||(e.changedTouches[0].pageX - dragZone.getBoundingClientRect().left)) - dragElement.offsetLeft;
        objectDragZone.mouseY = ((e.pageY - e.target.parentElement.getBoundingClientRect().top)||(e.changedTouches[0].pageY - dragZone.getBoundingClientRect().top)) - dragElement.offsetTop;
        objectDragZone.press = true;
        mousemove(e);

        function mousemove(e) {

            let limits = {
                top: options.limit.offsetTop,
                left: options.limit.offsetLeft,
                bottom: options.limit.offsetHeight + options.limit.offsetTop,
                right: options.limit.offsetWidth + options.limit.offsetLeft
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