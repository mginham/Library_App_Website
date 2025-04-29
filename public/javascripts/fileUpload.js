// Plugins to install
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
);

// Set a forced aspect ratio for the FilePond drop area
FilePond.setOptions({
    stylePanelAspectRatio: 150/100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150
});

// Turn file inputs into ponds
FilePond.parse(document.body);
