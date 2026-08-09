/**
 * ADRASTIA - GLOBAL JS
 * Handles Custom Cursor, Cart Interactions, and Global UI
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Custom Cursor Logic ---
    const cursor = document.querySelector(".custom-cursor");
    
    // Track mouse movement
    document.addEventListener("mousemove", (e) => {
        cursor.style.top = e.clientY + "px";
        cursor.style.left = e.clientX + "px";
    });

    // Elements that trigger cursor morph (links, buttons, product cards)
    const interactives = document.querySelectorAll("a, button, input, .product-card");
    
    interactives.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            cursor.classList.add("hovered");
        });
        el.addEventListener("mouseleave", () => {
            cursor.classList.remove("hovered");
        });
    });

    // Hide cursor when it leaves the window to avoid sticking on edges
    document.addEventListener("mouseleave", () => {
        cursor.style.display = "none";
    });
    document.addEventListener("mouseenter", () => {
        cursor.style.display = "block";
    });

    // --- 2. E-Commerce: Quick Add to Cart Simulation ---
    const cartToggle = document.querySelector(".cart-toggle");
    const cartCountSpan = document.querySelector(".cart-count");
    const addBtns = document.querySelectorAll(".quick-add-btn");
    
    let cartTotal = 0;

    addBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior if inside an <a>
            
            // Increment Cart
            cartTotal++;
            cartCountSpan.innerText = cartTotal;

            // Visual feedback on the button
            const originalText = btn.innerText;
            btn.innerText = "ADDED_ [✓]";
            btn.style.backgroundColor = "var(--accent-green)";
            btn.style.color = "var(--bg-color)";
            
            // Trigger animation on Nav Cart button
            cartToggle.classList.add("cart-shake");
            
            // Reset button and cart animation after timeout
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
                btn.style.color = "";
                cartToggle.classList.remove("cart-shake");
            }, 1500);
        });
    });
});