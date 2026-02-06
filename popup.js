window.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('olam-frame');
    const loadingScreen = document.getElementById('loading-screen');

    // Start loading the site
    iframe.src = "https://olam.in";

    // When the site is fully loaded, swap the loader for the iframe
    iframe.onload = () => {
        iframe.style.visibility = 'visible';
        loadingScreen.style.display = 'none';
    };
});