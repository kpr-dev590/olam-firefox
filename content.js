browser.runtime.onMessage.addListener((request) => {
    if (request.action === "OPEN_OLAM_POPUP") {
        // 1. Remove any old popup
        const old = document.getElementById("olam-context-bubble");
        if (old) old.remove();

        // 2. Get the position of the selected text
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // 3. Define dimensions
        const popupWidth = 500;
        const popupHeight = 450;
        const margin = 10;

        // 4. Calculate Position (Collision Detection)
        
        // --- Horizontal (X) Axis ---
        let left = rect.left; 
        if (left + popupWidth + margin > window.innerWidth) {
            left = window.innerWidth - popupWidth - margin;
        }
        if (left < margin) left = margin;

        // --- Vertical (Y) Axis ---
        let top = rect.bottom + margin;
        if (top + popupHeight + margin > window.innerHeight) {
            if (rect.top - popupHeight - margin > 0) {
                top = rect.top - popupHeight - margin; // Flip to top
            } else {
                top = window.innerHeight - popupHeight - margin; // Fit to bottom
            }
        }

        // 5. Create the popup container
        const container = document.createElement("div");
        container.id = "olam-context-bubble";
        
        Object.assign(container.style, {
            position: "fixed",
            top: `${top}px`, 
            left: `${left}px`,
            width: `${popupWidth}px`,
            height: `${popupHeight}px`,
            backgroundColor: "white",
            border: "2px solid #5d4037",
            borderRadius: "8px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            zIndex: "2147483647",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            fontFamily: "sans-serif"
        });

        // 6. Create Header
        const header = document.createElement("div");
        // Added cursor: move to indicate it is draggable
        header.style.cursor = "move"; 
        header.innerHTML = `
            <div style="background:#5d4037; color:white; padding:5px 10px; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
                <span>Olam Malayalam Dictionary</span>
                <span id="olam-close-x" style="cursor:pointer; font-size:18px; font-weight:bold;">×</span>
            </div>
        `;
        
        // 7. Create Iframe
        const iframe = document.createElement("iframe");
        iframe.src = request.url;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        // Disable pointer events on iframe WHILE dragging (optional optimization)
        iframe.style.pointerEvents = "auto"; 
        iframe.style.backgroundColor = "white";

        container.appendChild(header);
        container.appendChild(iframe);
        document.body.appendChild(container);

        // --- 8. DRAG LOGIC START ---
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseDown = (e) => {
            // Don't drag if clicking the close button
            if (e.target.id === "olam-close-x") return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            // Get the current position of the container
            const rect = container.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            // Prevent text selection inside the popup while dragging
            e.preventDefault();
            
            // Helpful: creates an invisible overlay so iframe doesn't steal mouse events
            iframe.style.pointerEvents = "none";
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            container.style.left = `${initialLeft + dx}px`;
            container.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                iframe.style.pointerEvents = "auto"; // Re-enable iframe interaction
            }
        };

        header.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        // --- DRAG LOGIC END ---

        // 9. Close logic
        const closePopup = () => {
            // Clean up event listeners to avoid memory leaks
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousedown", outsideClick);
            container.remove();
        };

        const outsideClick = (e) => {
            if (!container.contains(e.target)) closePopup();
        };

        container.querySelector("#olam-close-x").onclick = closePopup;
        setTimeout(() => {
            document.addEventListener("mousedown", outsideClick);
        }, 100);
    }
});