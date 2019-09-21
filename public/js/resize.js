let information = {};

function resize(e) {
    if (e.which !== 1) {
        return;
    }
    information.cursorX = e.pageX, information.cursorY = e.pageY;
    information.clamped = true;
    information.x = this.getBoundingClientRect().x, information.y = this.getBoundingClientRect().y;
}

document.querySelector('.resize__control').addEventListener('mousedown', resize);
document.addEventListener('mouseup', function () {
    information.clamped = false;
});

function move(e) {
    if (information.clamped) {
        e.currentTarget.style.transform = `translateX(${e.pageX - information.cursorX}px) translateY(${e.pageY - information.cursorY}px)`;
    }

    return false;
}

document.querySelector('.resize__control').addEventListener('mousemove', move);

