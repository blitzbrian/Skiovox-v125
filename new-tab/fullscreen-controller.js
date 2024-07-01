class FullscreenController {
    constructor(element) {
        element.addEventListener("click", this.onClicked.bind(this));

        this.icons = Array.from(element.children);
    }

    async onClicked() {
        // Make the window fullscreen
        await document.body.requestFullscreen();

        // Exit fullscreen
        chrome.windows.getCurrent((window) => {
            let updateInfo = {
                left: window.left,
                top: window.top,
                height: window.height,
                width: window.width,
            };

            console.log(updateInfo);

            chrome.windows.update(window.id, updateInfo, () => {
                if (chrome.runtime.lastError) {
                    // TODO: change some visual thing
                }
            });
        });
    }
}

export { FullscreenController };
