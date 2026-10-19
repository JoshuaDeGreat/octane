/** Visible browser area, including Safari's keyboard and pan offset. */
export const getWindowViewport = () => {
    const viewport = window.visualViewport;

    return {
        width: Math.max(1, Math.floor(viewport?.width ?? window.innerWidth)),
        height: Math.max(1, Math.floor(viewport?.height ?? window.innerHeight)),
        left: Math.max(0, viewport?.offsetLeft ?? 0),
        top: Math.max(0, viewport?.offsetTop ?? 0)
    };
};

export const syncWindowViewport = () => {
    const { width, height, left, top } = getWindowViewport();
    const style = document.documentElement.style;

    style.setProperty('--octane-app-width', `${width}px`);
    style.setProperty('--octane-app-height', `${height}px`);
    style.setProperty('--octane-viewport-left', `${left}px`);
    style.setProperty('--octane-viewport-top', `${top}px`);
};
