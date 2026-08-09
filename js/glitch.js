/**
 * ADRASTIA - GLITCH & ANIMATION JS
 * Handles Hacker Text Scramble and GSAP ScrollTriggers
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Hacker Text Scramble Effect on Hover ---
    const letters = "!<>-_\\/[]{}—=+*^?#_";
    const glitchHoverElements = document.querySelectorAll(".glitch-hover");

    glitchHoverElements.forEach(el => {
        el.addEventListener("mouseenter", event => {
            let iterations = 0;
            const originalText = event.target.dataset.text;
            
            clearInterval(el.interval);

            el.interval = setInterval(() => {
                event.target.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        if(index < iterations) {
                            return originalText[index];
                        }
                        return letters[Math.floor(Math.random() * letters.length)];
                    })
                    .join("");
                
                // Speed of scramble resolution
                if(iterations >= originalText.length){ 
                    clearInterval(el.interval);
                }
                iterations += 1 / 3; 
            }, 30);
        });
    });

    // --- 2. GSAP Scroll Animations ---
    // Ensure GSAP is loaded before running
    if (typeof gsap !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Section Elements - Load In
        const tl = gsap.timeline();
        tl.from(".hero-title", {
            y: 100,
            opacity: 0,
            duration: 0.8,
            ease: "power4.out",
            delay: 0.2
        })
        .from(".hero-subtext", {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power4.out"
        }, "-=0.4")
        .from(".cta-glitch", {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
        }, "-=0.2");

        // Manifesto Section - Brutalist reveal
        gsap.from(".manifesto-text", {
            scrollTrigger: {
                trigger: ".manifesto-section",
                start: "top 75%",
            },
            x: -100,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });

        gsap.from(".raw-image", {
            scrollTrigger: {
                trigger: ".manifesto-section",
                start: "top 75%",
            },
            x: 100,
            opacity: 0,
            rotation: 5,
            duration: 0.8,
            ease: "power3.out"
        });

        // Product Grid - Staggered pop-in
        gsap.from(".product-card", {
            scrollTrigger: {
                trigger: ".product-grid-section",
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15, // Creates the sequential pop-in effect
            ease: "power4.out"
        });

        // CTA Section - Scale and Fade
        gsap.from(".cta-section", {
            scrollTrigger: {
                trigger: ".cta-section",
                start: "top 80%",
            },
            scale: 0.95,
            opacity: 0,
            duration: 0.8,
            ease: "expo.out"
        });
    } else {
        console.warn("GSAP is not loaded. Scroll animations skipped.");
    }
});