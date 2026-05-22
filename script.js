// Initialize AOS (Animate On Scroll) library
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        once: true, // whether animation should happen only once - while scrolling down
        offset: 50, // offset (in px) from the original trigger point
        duration: 1000 // duration of the animation in milliseconds
    });
});

// You can add more custom JavaScript below this line in the future
// For example: custom video player controls, form validation, etc.

// --- Skills Interactive Showcase & Video Play Logic ---
// --- Disable Inspect Shortcuts ---
document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function (e) {
    // Disable F12
    if (e.keyCode == 123) {
        return false;
    }
    // Disable Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    // Disable Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    // Disable Ctrl+U
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
    // Disable Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (menuToggle.querySelector('i')) menuToggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });

        // Close mobile menu on scroll
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (navLinks.classList.contains('active') && Math.abs(window.scrollY - lastScrollY) > 10) {
                navLinks.classList.remove('active');
                if (menuToggle.querySelector('i')) menuToggle.querySelector('i').className = 'fa-solid fa-bars';
            }
            lastScrollY = window.scrollY;
        });
    }

    const skillItems = document.querySelectorAll('.skill-item');

    // Skills Toggle Event Listener
    skillItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items first
            skillItems.forEach(i => i.classList.remove('active'));

            // If it wasn't already active, make it active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- Dynamic Instagram Video Fetching via Backend ---
    const igCards = document.querySelectorAll('.ig-reel-card');
    igCards.forEach(card => {
        const igUrl = card.getAttribute('data-ig-url');
        const video = card.querySelector('video');
        const title = card.querySelector('.project-title');
        const detailsBtn = card.querySelector('.view-details-btn');

        if (igUrl && video) {
            // Clean the URL by removing extra tracking parameters (like ?utm_source) for the scraper
            const cleanUrl = igUrl.split('?')[0];

            fetch('http://localhost:3001/api/get-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: cleanUrl })
            })
            .then(res => res.json())
            .then(data => {
                if (data.videoUrl) {
                    video.src = data.videoUrl;
                    title.innerText = "Instagram Reel";
                    if (detailsBtn) detailsBtn.setAttribute('data-video', data.videoUrl);
                } else {
                    title.innerText = "Failed to load";
                }
            })
            .catch(err => {
                console.error("Error fetching IG video:", err);
                title.innerText = "Error loading";
            });
        }
    });

    // --- Video Hover Play & Fullscreen ---
    const videoCards = document.querySelectorAll('.video-card');

    videoCards.forEach(card => {
        const video = card.querySelector('video');
        const volBtn = card.querySelector('.volume-btn');
        const volSlider = card.querySelector('.volume-slider');

        // Helper to update volume icon based on level
        const updateVolumeIcon = () => {
            const icon = volBtn.querySelector('i');
            if (video.muted || video.volume === 0) {
                icon.className = 'fa-solid fa-volume-xmark';
            } else if (video.volume < 0.5) {
                icon.className = 'fa-solid fa-volume-low';
            } else {
                icon.className = 'fa-solid fa-volume-high';
            }
        };

        // Toggle Volume logic
        if (volBtn && video) {
            volBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent conflicts with overlay
                video.muted = !video.muted;
                if (!video.muted && video.volume === 0) {
                    video.volume = 1;
                    if(volSlider) volSlider.value = 1;
                }
                updateVolumeIcon();
            });
        }

        // Volume Slider logic
        if (volSlider && video) {
            volSlider.addEventListener('click', (e) => e.stopPropagation()); // Prevent triggering other clicks
            volSlider.addEventListener('input', (e) => {
                e.stopPropagation();
                video.volume = e.target.value;
                video.muted = video.volume == 0;
                updateVolumeIcon();
            });
        }

        // Open Fullscreen custom modal on card click
        if (video) {
            card.style.cursor = 'pointer'; // Make it clear the card is clickable
            card.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent conflicts
                const fsModal = document.getElementById('fs-video-modal');
                const fsModalVideo = document.getElementById('fs-modal-video');
                if (fsModal && fsModalVideo) {
                    fsModalVideo.src = video.src;
                    fsModal.style.display = 'flex';
                    fsModalVideo.currentTime = 0;
                    fsModalVideo.play();
                }
            });
        }
    });

    // --- Contact Form AJAX Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent the default form submission page redirect

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            const actionUrl = contactForm.getAttribute('action').replace('formsubmit.co/', 'formsubmit.co/ajax/');

            fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.innerText = 'Message is sent!';
                contactForm.reset();
                setTimeout(() => {
                    window.location.href = window.location.pathname; // Reloads the site and starts from the top
                }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerText = 'Error sending message';
                setTimeout(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }, 3000);
            });
        });
    }

    // --- Cinematic Story Scroll Animation ---
    const cinematicSection = document.getElementById('cinematic-section');
    const cinematicShowcase = document.querySelector('.cinematic-showcase');

    if (cinematicSection && cinematicShowcase) {
        window.addEventListener('scroll', () => {
            const sectionTop = cinematicSection.offsetTop;
            const scrollPos = window.scrollY;
            const windowHeight = window.innerHeight;
            
            // Calculate scroll distance relative to the section
            const relativeScroll = scrollPos - sectionTop;
            
            // Step transitions based on halfway points of 100vh blocks
            if (relativeScroll < windowHeight * 0.5) {
                cinematicShowcase.className = 'cinematic-showcase step-1';
            } else if (relativeScroll >= windowHeight * 0.5 && relativeScroll < windowHeight * 1.5) {
                cinematicShowcase.className = 'cinematic-showcase step-2';
            } else {
                cinematicShowcase.className = 'cinematic-showcase step-3';
            }
        });
    }

    // --- GSAP Scrolling Tabs Logic ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Pin the intro text section
        ScrollTrigger.create({
            trigger: ".intro-wrapper",
            start: "top top",
            end: "bottom top",
            pin: ".text-align-center",
            pinSpacing: false
        });

        // Handling the scroll for the tabs
        window.addEventListener("scroll", function () {
            let scrollPosition = window.scrollY;
            let tabsSection = document.querySelector('.section_tabs');
            if (!tabsSection) return;
            
            // Adjust math based on where the component lives on the page
            let sectionTop = tabsSection.offsetTop;
            let windowHeight = window.innerHeight + 550; 
            let sections = document.querySelectorAll('.tabs_let-content');
            let videos = document.querySelectorAll('.tabs_video');
            let lastSectionIndex = sections.length - 1;
            
            let relativeScroll = scrollPosition - sectionTop + (window.innerHeight / 2);

            // Trigger classes based on dynamic relative position
            if (relativeScroll < 0) {
                sections.forEach((sec, i) => {
                    if(i === 0) { sec.classList.add('is-1'); if(videos[i]) videos[i].classList.add('is-1'); }
                    else { sec.classList.remove('is-1'); if(videos[i]) videos[i].classList.remove('is-1'); }
                });
                return;
            }

            sections.forEach((section, index) => {
                if (relativeScroll >= (index * windowHeight) && relativeScroll < ((index + 1) * windowHeight)) {
                    section.classList.add('is-1');
                    if(videos[index]) videos[index].classList.add('is-1');
                } else if (index !== lastSectionIndex) {
                    section.classList.remove('is-1');
                    if(videos[index]) videos[index].classList.remove('is-1');
                }
            });

            if (relativeScroll > (lastSectionIndex * windowHeight)) {
                sections[lastSectionIndex].classList.add('is-1');
                if(videos[lastSectionIndex]) videos[lastSectionIndex].classList.add('is-1');
            } else if (relativeScroll >= ((lastSectionIndex - 1) * windowHeight) && relativeScroll < (lastSectionIndex * windowHeight)) {
                sections[lastSectionIndex].classList.remove('is-1');
                if(videos[lastSectionIndex]) videos[lastSectionIndex].classList.remove('is-1');
            }
        });
    }

    // --- Modal Logic ---
    const modal = document.getElementById('project-modal');
    const modalVideo = document.getElementById('modal-video');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const closeModal = document.querySelector('.close-modal');
    const modalLayout = document.querySelector('.modal-layout');

    if (modal) {
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const videoSrc = btn.getAttribute('data-video');
                const type = btn.getAttribute('data-type');
                const title = btn.getAttribute('data-title');
                const desc = btn.getAttribute('data-desc');

                if (videoSrc) {
                    modalVideo.src = videoSrc;
                }
                modalTitle.innerText = title || 'Project Details';
                modalDesc.innerText = desc || '';
                
                modalLayout.className = 'modal-layout ' + (type || 'horizontal');
                
                modal.style.display = 'block';
                modalVideo.currentTime = 0;
                modalVideo.play();
            });
        });

        const closeAndPause = () => {
            modal.style.display = 'none';
            modalVideo.pause();
            modalVideo.src = '';
        };

        if (closeModal) {
            closeModal.addEventListener('click', closeAndPause);
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAndPause();
            }
        });
    }

    // --- Fullscreen Video Modal Logic ---
    const fsModal = document.getElementById('fs-video-modal');
    const fsModalVideo = document.getElementById('fs-modal-video');
    const closeFsModal = document.querySelector('.close-fs-modal');

    if (fsModal && fsModalVideo) {
        const closeFsAndPause = () => {
            fsModal.style.display = 'none';
            fsModalVideo.pause();
            fsModalVideo.src = '';
        };

        if (closeFsModal) {
            closeFsModal.addEventListener('click', closeFsAndPause);
        }

        window.addEventListener('click', (e) => {
            if (e.target === fsModal) {
                closeFsAndPause();
            }
        });
    }

    // --- Dome Gallery Logic ---
    const domeRoot = document.getElementById('dome-gallery-root');
    if (domeRoot) {
        const main = document.getElementById('dome-main');
        const sphere = document.getElementById('dome-sphere');
        const frame = document.getElementById('dome-frame');
        const viewer = document.getElementById('dome-viewer');
        const scrim = document.getElementById('dome-scrim');
        
        const segments = 35;
        const maxVerticalRotationDeg = 5;
        const dragSensitivity = 20;
        const enlargeTransitionMs = 300;
        const padFactor = 0.25;

        // Compressed thumbnails for fast dome loading (~30-70KB each)
        const imagesPool = [
            'images/For Portfolio/compressed/01 (2).jpg',
            'images/For Portfolio/compressed/01 TRUE3681.jpg',
            'images/For Portfolio/compressed/01.jpg',
            'images/For Portfolio/compressed/02.jpg',
            'images/For Portfolio/compressed/03 (2).jpg',
            'images/For Portfolio/compressed/03 TRUE3684.jpg',
            'images/For Portfolio/compressed/03.jpg',
            'images/For Portfolio/compressed/32.jpg',
            'images/For Portfolio/compressed/701.jpg',
            'images/For Portfolio/compressed/702.jpg',
            'images/For Portfolio/compressed/703.jpg',
            'images/For Portfolio/compressed/704.jpg',
            'images/For Portfolio/compressed/CH-01.jpg',
            'images/For Portfolio/compressed/CH-04.jpg',
            'images/For Portfolio/compressed/Design 1.jpg',
            'images/For Portfolio/compressed/Design 2.jpg',
            'images/For Portfolio/compressed/Design 3.jpg',
            'images/For Portfolio/compressed/GD-08.jpg',
            'images/For Portfolio/compressed/GD-17.jpg',
            'images/For Portfolio/compressed/Jewellery (1).jpg',
            'images/For Portfolio/compressed/Jewellery (2).jpg',
            'images/For Portfolio/compressed/Jewellery (3).jpg',
            'images/For Portfolio/compressed/Jewellery (4).jpg',
            'images/For Portfolio/compressed/PT - 001-a.jpg',
            'images/For Portfolio/compressed/PT - 001.jpg',
            'images/For Portfolio/compressed/PT - 007-a.jpg',
            'images/For Portfolio/compressed/PT - 007.jpg',
            'images/For Portfolio/compressed/PT - 008-a.jpg',
            'images/For Portfolio/compressed/PT - 008.jpg',
            'images/For Portfolio/compressed/PT - 009-a.jpg',
            'images/For Portfolio/compressed/PT - 009.jpg',
            'images/For Portfolio/compressed/TRUE0460.jpg',
            'images/For Portfolio/compressed/TRUE0464.jpg',
            'images/For Portfolio/compressed/TRUE0928.jpg',
            'images/For Portfolio/compressed/TRUE0930.jpg',
            'images/For Portfolio/compressed/TRUE0940.jpg',
            'images/For Portfolio/compressed/TRUE2523.jpg',
            'images/For Portfolio/compressed/TRUE2541.jpg',
            'images/For Portfolio/compressed/TRUE3708.jpg',
            'images/For Portfolio/compressed/TRUE4189.jpg',
            'images/For Portfolio/compressed/TRUE4200.jpg',
            'images/For Portfolio/compressed/TRUE4251.jpg',
            'images/For Portfolio/compressed/TRUE4253.jpg',
            'images/For Portfolio/compressed/TRUE4283.jpg',
            'images/For Portfolio/compressed/TRUE9206.jpg',
            'images/For Portfolio/compressed/TRUE9234.jpg',
            'images/For Portfolio/compressed/pikaso_edit (1).jpg'
        ];

        // Full-res originals for the enlarged viewer (loaded on-demand when clicked)
        const fullResPool = [
            'images/For Portfolio/01.jpg',
            'images/For Portfolio/02.jpg',
            'images/For Portfolio/03.jpg',
            'images/For Portfolio/04.jpg',
            'images/For Portfolio/05.JPG',
            'images/For Portfolio/06.jpg',
            'images/For Portfolio/07.jpg',
            'images/For Portfolio/08.JPG',
            'images/For Portfolio/09.JPG',
            'images/For Portfolio/10.JPG',
            'images/For Portfolio/11.JPG',
            'images/For Portfolio/12.JPG',
            'images/For Portfolio/13.JPG',
            'images/For Portfolio/14.JPG',
            'images/For Portfolio/15.png',
            'images/For Portfolio/16.png',
            'images/For Portfolio/17.png',
            'images/For Portfolio/18.JPG',
            'images/For Portfolio/19.JPG',
            'images/For Portfolio/20.JPG',
            'images/For Portfolio1/21.JPG',
            'images/For Portfolio1/22.JPG',
            'images/For Portfolio1/23.JPG',
            'images/For Portfolio1/24.JPG',
            'images/For Portfolio1/25.JPG',
            'images/For Portfolio1/26.JPG',
            'images/For Portfolio1/27.JPG',
            'images/For Portfolio1/28.JPG',
            'images/For Portfolio1/29.JPG',
            'images/For Portfolio1/30.JPG',
            'images/For Portfolio1/31.JPG',
            'images/For Portfolio1/32.JPG',
            'images/For Portfolio1/33.JPG',
            'images/For Portfolio1/34.jpg',
            'images/For Portfolio1/35.jpg',
            'images/For Portfolio1/36.jpg',
            'images/For Portfolio1/37.JPG',
            'images/For Portfolio1/38.JPG',
            'images/For Portfolio1/39.jpg',
            'images/For Portfolio1/40.JPG',
            'images/For Portfolio1/41.JPG',
            'images/For Portfolio1/42.JPG',
            'images/For Portfolio1/43.JPG',
            'images/For Portfolio1/44.JPG',
            'images/For Portfolio1/45.JPG',
            'images/For Portfolio1/46.JPG',
            'images/For Portfolio1/47.jpg'
        ];

        const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
        const wrapAngleSigned = deg => ((((deg + 180) % 360) + 360) % 360) - 180;

        // Calculate placements
        const xCols = Array.from({ length: segments }, (_, i) => -37 + i * 2);
        const evenYs = [-4, -2, 0, 2, 4];
        const oddYs = [-3, -1, 1, 3, 5];
        const coords = xCols.flatMap((x, c) => {
            const ys = c % 2 === 0 ? evenYs : oddYs;
            return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
        });

        let dragging = false;
        let moved = false;
        let opening = false;
        let rotX = 0, rotY = 0;
        let startRot = { x: 0, y: 0 };
        let startPos = { x: 0, y: 0 };
        let lastDragEndAt = 0;
        let openStartedAt = 0;
        let originalTilePosition = null;
        let focusedEl = null;
        let inertiaRAF = null;

        const applyTransform = (x, y) => {
            if (sphere) sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${x}deg) rotateY(${y}deg)`;
        };
        applyTransform(rotX, rotY);

        // Build DOM Nodes
        coords.forEach((it, i) => {
            const src = imagesPool[i % imagesPool.length];
            const fullResSrc = fullResPool[i % fullResPool.length];
            const el = document.createElement('div');
            el.className = 'item';
            el.dataset.src = src;
            el.dataset.offsetX = it.x;
            el.dataset.offsetY = it.y;
            el.style.setProperty('--offset-x', it.x);
            el.style.setProperty('--offset-y', it.y);
            el.style.setProperty('--item-size-x', it.sizeX);
            el.style.setProperty('--item-size-y', it.sizeY);

            const imgContainer = document.createElement('div');
            imgContainer.className = 'item__image';
            imgContainer.setAttribute('role', 'button');
            imgContainer.tabIndex = 0;

            const img = document.createElement('img');
            img.src = src;
            img.loading = 'lazy';
            img.draggable = false;

            imgContainer.appendChild(img);
            el.appendChild(imgContainer);
            sphere.appendChild(el);

            imgContainer.addEventListener('click', () => {
                if (dragging || moved || performance.now() - lastDragEndAt < 80 || opening) return;
                opening = true;
                openStartedAt = performance.now();
                document.body.classList.add('dg-scroll-lock');
                focusedEl = imgContainer;

                const offsetX = it.x;
                const offsetY = it.y;
                const unit = 360 / segments / 2;
                const rotateY = unit * (offsetX + (it.sizeX - 1) / 2);
                const rotateX = unit * (offsetY - (it.sizeY - 1) / 2);

                const pY = ((rotateY % 360) + 360) % 360;
                const gY = ((rotY % 360) + 360) % 360;
                let rY = -(pY + gY) % 360;
                if (rY < -180) rY += 360;
                const rX = -rotateX - rotX;

                el.style.setProperty('--rot-y-delta', `${rY}deg`);
                el.style.setProperty('--rot-x-delta', `${rX}deg`);

                const refDiv = document.createElement('div');
                refDiv.className = 'item__image item__image--reference';
                refDiv.style.opacity = '0';
                refDiv.style.transform = `rotateX(${-rotateX}deg) rotateY(${-rotateY}deg)`;
                el.appendChild(refDiv);

                requestAnimationFrame(() => {
                    const tileR = refDiv.getBoundingClientRect();
                    const frameR = frame.getBoundingClientRect();
                    const mainR = main.getBoundingClientRect();
                    
                    if (tileR.width <= 0) return;
                    originalTilePosition = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
                    imgContainer.style.visibility = 'hidden';

                    const overlay = document.createElement('div');
                    overlay.className = 'enlarge';
                    overlay.style.position = 'absolute';
                    overlay.style.left = (frameR.left - mainR.left) + 'px';
                    overlay.style.top = (frameR.top - mainR.top) + 'px';
                    overlay.style.width = frameR.width + 'px';
                    overlay.style.height = frameR.height + 'px';
                    overlay.style.opacity = '0';
                    overlay.style.zIndex = '30';
                    overlay.style.transformOrigin = 'top left';
                    overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;

                    const enlargeImg = document.createElement('img');
                    enlargeImg.src = fullResSrc;
                    overlay.appendChild(enlargeImg);
                    viewer.appendChild(overlay);

                    const tx0 = tileR.left - frameR.left;
                    const ty0 = tileR.top - frameR.top;
                    const sx0 = tileR.width / frameR.width;
                    const sy0 = tileR.height / frameR.height;

                    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${sx0}, ${sy0})`;

                    setTimeout(() => {
                        overlay.style.opacity = '1';
                        overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
                        domeRoot.setAttribute('data-enlarging', 'true');
                    }, 16);
                });
            });
        });

        // Close Enlarge logic
        scrim.addEventListener('click', () => {
            if (performance.now() - openStartedAt < 250) return;
            if (!focusedEl) return;
            
            const parent = focusedEl.parentElement;
            const overlay = viewer.querySelector('.enlarge');
            const refDiv = parent.querySelector('.item__image--reference');
            
            if (!overlay || !originalTilePosition) return;
            
            const currentRect = overlay.getBoundingClientRect();
            const rootRect = domeRoot.getBoundingClientRect();
            
            const animatingOverlay = document.createElement('div');
            animatingOverlay.className = 'enlarge-closing';
            animatingOverlay.style.cssText = `position:absolute; left:${currentRect.left - rootRect.left}px; top:${currentRect.top - rootRect.top}px; width:${currentRect.width}px; height:${currentRect.height}px; z-index:9999; border-radius: var(--enlarge-radius, 32px); overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.35); transition:all ${enlargeTransitionMs}ms ease-out; pointer-events:none; margin:0; transform:none;`;
            
            const imgClone = overlay.querySelector('img').cloneNode();
            animatingOverlay.appendChild(imgClone);
            
            overlay.remove();
            domeRoot.appendChild(animatingOverlay);
            
            requestAnimationFrame(() => {
                animatingOverlay.style.left = (originalTilePosition.left - rootRect.left) + 'px';
                animatingOverlay.style.top = (originalTilePosition.top - rootRect.top) + 'px';
                animatingOverlay.style.width = originalTilePosition.width + 'px';
                animatingOverlay.style.height = originalTilePosition.height + 'px';
                animatingOverlay.style.opacity = '0';
            });
            
            animatingOverlay.addEventListener('transitionend', () => {
                animatingOverlay.remove();
                if (refDiv) refDiv.remove();
                parent.style.setProperty('--rot-y-delta', '0deg');
                parent.style.setProperty('--rot-x-delta', '0deg');
                
                focusedEl.style.visibility = '';
                focusedEl.style.opacity = '1';
                focusedEl = null;
                originalTilePosition = null;
                domeRoot.removeAttribute('data-enlarging');
                opening = false;
                document.body.classList.remove('dg-scroll-lock');
            }, { once: true });
        });

        // Drag Logic
        main.addEventListener('pointerdown', (e) => {
            if (focusedEl) return;
            if (inertiaRAF) cancelAnimationFrame(inertiaRAF);
            dragging = true; moved = false;
            startRot = { x: rotX, y: rotY };
            startPos = { x: e.clientX, y: e.clientY };
        });

        main.addEventListener('pointermove', (e) => {
            if (!dragging || focusedEl) return;
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;
            if (dx * dx + dy * dy > 16) moved = true;
            
            rotX = clamp(startRot.x - dy / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
            rotY = wrapAngleSigned(startRot.y + dx / dragSensitivity);
            applyTransform(rotX, rotY);
        });

        window.addEventListener('pointerup', () => {
            if (dragging && moved) lastDragEndAt = performance.now();
            dragging = false;
        });

        // Responsiveness
        const resizeObserver = new ResizeObserver(entries => {
            const cr = entries[0].contentRect;
            const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
            
            // Calculate ideal image width for a medium size
            // Target ~35% of screen width on mobile, and 160px max on desktop
            const targetPerceivedWidth = w < 768 ? w * 0.35 : 160;
            
            // Perspective scaling factor (compensates for the distance pushback in 3D space)
            const actualPhysicalWidth = targetPerceivedWidth * 1.5; 
            
            // Reverse engineer radius: physicalWidth = 2 * (radius * 3.14) / segments
            let radius = (actualPhysicalWidth * segments) / (2 * 3.14);
            
            domeRoot.style.setProperty('--radius', `${Math.round(radius)}px`);
            domeRoot.style.setProperty('--viewer-pad', `${Math.max(15, w * 0.05)}px`);
        });
        resizeObserver.observe(domeRoot);
    }

    // --- Logo Loop Logic ---
    const track = document.getElementById('logo-loop-track');
    if (track) {
        const speed = 50; // pixels per second
        let targetVelocity = speed;
        let currentVelocity = speed;
        const tau = 0.25; // smoothing coefficient
        
        let offset = 0;
        let lastTime = null;
        let seqWidth = 0;
        
        const list = track.querySelector('.logoloop__list');
        if (list) {
            // Clone the list to ensure there's enough content to scroll infinitely
            // We append 3 copies to make sure even on ultrawide screens it loops perfectly
            for (let i = 0; i < 3; i++) {
                const clone = list.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            }
            
            const updateWidth = () => {
                // Ensure seqWidth is based on the original single list width
                seqWidth = list.getBoundingClientRect().width;
            };
            
            // Wait for elements (and potential images) to render
            window.addEventListener('load', updateWidth);
            window.addEventListener('resize', updateWidth);
            updateWidth();
            
            // Pause on hover
            track.addEventListener('mouseenter', () => targetVelocity = 0);
            track.addEventListener('mouseleave', () => targetVelocity = speed);
            
            const animate = (time) => {
                if (lastTime === null) lastTime = time;
                const dt = Math.max(0, time - lastTime) / 1000;
                lastTime = time;
                
                const easingFactor = 1 - Math.exp(-dt / tau);
                currentVelocity += (targetVelocity - currentVelocity) * easingFactor;
                
                if (seqWidth > 0) {
                    offset += currentVelocity * dt;
                    // Keep offset bounded within the width of a single list instance
                    offset = ((offset % seqWidth) + seqWidth) % seqWidth;
                    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
                }
                
                requestAnimationFrame(animate);
            };
            
            requestAnimationFrame(animate);
        }
    }
});