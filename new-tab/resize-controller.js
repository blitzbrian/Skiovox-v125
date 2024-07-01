class Coords {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromEvent(event) {
        return new Coords(event.screenX, event.screenY);
    }

    static fromChrome(window) {
        return new Coords(window.left, window.top);
    }

    static fromDifference(c1, c2) {
        return new Coords(c1.x - c2.x, c1.y - c2.y);
    }
}

class ResizeController {
    type;
    clickOffset;
    currentWindow;

    constructor(left, right, top, bottom) {
        left.addEventListener("mousedown", (e) => this.onMouseDown(e, "left"));
        right.addEventListener("mousedown", (e) =>
            this.onMouseDown(e, "right")
        );
        top.addEventListener("mousedown", (e) => this.onMouseDown(e, "top"));
        bottom.addEventListener("mousedown", (e) =>
            this.onMouseDown(e, "bottom")
        );

        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mouseup", this.invalidateMouseDown.bind(this));
        window.addEventListener("blur", this.invalidateMouseDown.bind(this));
    }

    onMouseDown(event, type) {
        this.type = type;

        chrome.windows.getCurrent((window) => {
            let windowCoords = Coords.fromChrome(window);
            let clickCoords = Coords.fromEvent(event);
            this.clickOffset = clickCoords
            this.currentWindow = window;
        });
    }

    onMouseMove(event) {
        if (this.type === null) return;
        if (!this.clickOffset) return;
        if (!this.currentWindow) return;

        let mouseCoords = Coords.fromEvent(event);
        let deltaCoords = Coords.fromDifference(mouseCoords, this.clickOffset);
        let updateInfo;

        switch (this.type) {
            case "left":
                updateInfo = {
                    left: this.currentWindow.left + deltaCoords.x,
                    top: this.currentWindow.top,
                    height: this.currentWindow.height,
                    width: this.currentWindow.width - deltaCoords.x,
                };
                break;
            case "right":
                updateInfo = {
                    left: this.currentWindow.left,
                    top: this.currentWindow.top,
                    height: this.currentWindow.height,
                    width: this.currentWindow.width + deltaCoords.x,
                };
                break;
            case "top":
                updateInfo = {
                    left: this.currentWindow.left,
                    top: this.currentWindow.top + deltaCoords.y,
                    height: this.currentWindow.height - deltaCoords.y,
                    width: this.currentWindow.width,
                };
                break;
            case "bottom":
                updateInfo = {
                    left: this.currentWindow.left,
                    top: this.currentWindow.top,
                    height: this.currentWindow.height + deltaCoords.y,
                    width: this.currentWindow.width,
                };
                break;
        }

        chrome.windows.update(this.currentWindow.id, updateInfo, () => {
            if (chrome.runtime.lastError) {
                // TODO: change some visual thing
            }
        });
    }

    invalidateMouseDown(event) {
        this.type = null;
    }
}

export { ResizeController };
