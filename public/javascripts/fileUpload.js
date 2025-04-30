// Get styles
const rootStyles = window.getComputedStyle(document.documentElement);

// Wait for style file to be loaded
if (rootStyles.getPropertyValue('--book-cover-width-large') != null && rootStyles.getPropertyValue('--book-cover-width-large') != '') {
    ready();
} else {
    document.getElementById('main.css').addEventListener('load', ready);
}

function ready () {
    const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
    const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
    const coverHeight = coverWidth / coverAspectRatio;

    // Plugins to install
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode
    );

    // Set a forced aspect ratio for the FilePond drop area
    FilePond.setOptions({
        stylePanelAspectRatio: 1/coverAspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight
    });

    // Turn file inputs into ponds
    FilePond.parse(document.body);
}
