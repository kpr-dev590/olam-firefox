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

        // 3. Create the popup container
        const container = document.createElement("div");
        container.id = "olam-context-bubble";
        
        Object.assign(container.style, {
            position: "fixed",
            top: `${rect.bottom + window.scrollY + 10}px`,
            left: `${rect.left + window.scrollX}px`,
            width: "500px",
            height: "450px",
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

        // 4. Create Header
        const header = document.createElement("div");
        // Update: Added 'cursor: move' to indicate it's draggable
        header.style.cursor = "move"; 
        header.innerHTML = `
            <div style="background:#5d4037; color:white; padding:5px 10px; font-size:12px; display:flex; justify-content:space-between; align-items:center; user-select: none;">
                <span style="pointer-events: none;">Olam Malayalam Dictionary</span>
                <span id="olam-close-x" style="cursor:pointer; font-size:18px; font-weight:bold;">×</span>
            </div>
        `;
        
        // 5. Create Iframe
        const iframe = document.createElement("iframe");
        iframe.src = request.url;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.backgroundColor = "white";

        container.appendChild(header);
        container.appendChild(iframe);
        document.body.appendChild(container);

        // --- DRAG FUNCTIONALITY START ---
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        header.onmousedown = function(e) {
            // Prevent drag if clicking the close button specifically
            if (e.target.id === 'olam-close-x') return;

            isDragging = true;
            
            // Calculate where the mouse is relative to the container corner
            const containerRect = container.getBoundingClientRect();
            dragOffsetX = e.clientX - containerRect.left;
            dragOffsetY = e.clientY - containerRect.top;

            // Important: Disable iframe events so the mouse doesn't get 'swallowed' by the iframe when dragging fast
            iframe.style.pointerEvents = "none";

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        function onMouseMove(e) {
            if (!isDragging) return;
            
            // Calculate new position
            const newLeft = e.clientX - dragOffsetX;
            const newTop = e.clientY - dragOffsetY;

            container.style.left = `${newLeft}px`;
            container.style.top = `${newTop}px`;
        }

        function onMouseUp() {
            isDragging = false;
            // Re-enable iframe interaction
            iframe.style.pointerEvents = "auto";
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        // --- DRAG FUNCTIONALITY END ---

        // 6. Close logic
        const closePopup = () => {
            container.remove();
            document.removeEventListener("mousedown", outsideClick);
            // Clean up drag listeners just in case
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        const outsideClick = (e) => {
            // Don't close if we are currently dragging
            if (isDragging) return;
            if (!container.contains(e.target)) closePopup();
        };

        container.querySelector("#olam-close-x").onclick = closePopup;
        
        setTimeout(() => {
            document.addEventListener("mousedown", outsideClick);
        }, 100);
    }
});