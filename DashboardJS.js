// Function to update the event slider with fetched data
function updateEventSlider() {
    const sliderContainer = document.querySelector('.slider');
    sliderContainer.innerHTML = ''; // Clear existing content

    // Loop through events and create slider items dynamically
    window.dynamicEvents.forEach((event) => {
        const eventElement = document.createElement('div');
        eventElement.classList.add('slider-item');

        eventElement.innerHTML = `
            <img src="${event.posterUrl}" alt="${event.name}">
            <div class="text-container">
                <h1>${event.name}</h1>
                <p>${event.locationName}</p>
                <p>${event.date}</p>
                <p>${event.time}</p>
            </div>
        `;

        // Add click event to show popup
        eventElement.addEventListener('click', () => {
            showPopup(event);
        });

        sliderContainer.appendChild(eventElement);
    });

    let currentIndex = 0;
    const slides = document.querySelectorAll(".slider-item");
    const dotsContainer = document.querySelector(".dots-container");
    const dots = [];
    const gap = 10; // Gap between images

    // Popup Logic
    const popupContainer = document.getElementById('popup-container');
    const popupClose = document.getElementById('popup-close');
    const popupPoster = document.getElementById('popup-poster');
    const popupTitle = document.getElementById('popup-title');
    const popupDate = document.getElementById('popup-date');
    const popupTime = document.getElementById('popup-time');
    const popupLocation = document.getElementById('popup-location');
    const popupDescription = document.getElementById('popup-description');

    function showPopup(event) {
        popupPoster.src = event.posterUrl;
        popupPoster.alt = event.name;
        popupTitle.textContent = event.name;
        popupDate.innerHTML = `<strong>Date:</strong> ${event.date}`;
        popupTime.innerHTML = `<strong>Time:</strong> ${event.time}`;
        popupLocation.innerHTML = `<strong>Location:</strong> ${event.locationName}`;
        popupDescription.innerHTML = `<strong>Details:</strong> ${event.details}`;
        popupContainer.classList.add('visible');
    }
    

    function hidePopup() {
        popupContainer.classList.remove('visible');
    }

    popupClose.addEventListener('click', hidePopup);
    popupContainer.addEventListener('click', (e) => {
        if (e.target === popupContainer) {
            hidePopup();
        }
    });

    // Add full-screen image view logic
    popupPoster.addEventListener('click', () => {
        showImageInFocus(popupPoster.src);
    });

    function showImageInFocus(imageSrc) {
        // Check if a focus container already exists and remove it
        const existingFocusContainer = document.querySelector('.focus-container');
        if (existingFocusContainer) {
            existingFocusContainer.remove();
        }
    
        // Create a new focus container
        const focusContainer = document.createElement('div');
        focusContainer.classList.add('focus-container');
        focusContainer.innerHTML = `
            <div class="focus-content">
                <span class="focus-close">&times;</span>
                <img src="${imageSrc}" alt="Focused Image" class="focus-image">
            </div>
        `;
    
        document.body.appendChild(focusContainer);
    
        const focusClose = focusContainer.querySelector('.focus-close');
        focusClose.addEventListener('click', () => {
            document.body.removeChild(focusContainer);
        });
    
        focusContainer.addEventListener('click', (e) => {
            if (e.target === focusContainer) {
                document.body.removeChild(focusContainer);
            }
        });
    }
    

    // Dynamically calculate the number of slides per page based on the screen width
    function calculateSlidesPerPage() {
        if (window.innerWidth <= 480) {
            return 1; // For small screens (1 slide per page)
        } else if (window.innerWidth <= 768) {
            return 2; // For medium screens (2 slides per page)
        } else {
            return 3; // For large screens (3 slides per page)
        }
    }

    // Function to update the slider whenever the screen size changes
    function updateSlider() {
        const slidesPerPage = calculateSlidesPerPage();
        const slideWidth = slides[0].offsetWidth + gap;

        const slider = document.querySelector(".slider");
        slider.style.transform = `translateX(-${currentIndex * slideWidth * slidesPerPage}px)`; // Adjust for new number of slides per page

        // Update active dot
        dots.forEach(dot => dot.classList.remove("active"));
        dots[currentIndex].classList.add("active");
    }

    // Dynamically generate dots based on the number of slides per page
    function generateDots() {
        const slidesPerPage = calculateSlidesPerPage();
        const numDots = Math.ceil(slides.length / slidesPerPage);

        // Clear existing dots
        dotsContainer.innerHTML = "";

        // Create new dots based on the number of slides per page
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            dot.onclick = () => currentSlide(i);
            dots.push(dot);
            dotsContainer.appendChild(dot);
        }

        updateSlider(); // Update the slider with the new dots
    }

    // Move the slider by a certain number of steps
    function moveSlide(step) {
        const slidesPerPage = calculateSlidesPerPage();
        currentIndex += step;

        if (currentIndex < 0) {
            currentIndex = Math.ceil(slides.length / slidesPerPage) - 1; // Loop back to the last set of slides
        }
        if (currentIndex >= Math.ceil(slides.length / slidesPerPage)) {
            currentIndex = 0; // Loop back to the first set of slides
        }

        updateSlider();
    }

    // Jump to the specified slide
    function currentSlide(index) {
        currentIndex = index;
        updateSlider();
    }

    // Initial setup
    window.addEventListener("resize", generateDots); // Regenerate dots when window is resized
    generateDots(); // Generate the dots when the page loads

    // Add event listeners for prev/next buttons
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    // Assign actions to the prev and next buttons
    prevButton.addEventListener('click', () => moveSlide(-1)); // Move one step back
    nextButton.addEventListener('click', () => moveSlide(1)); // Move one step forward
}

// Call this function when the page is loaded, or when the events are fetched
window.onload = updateEventSlider;


    
    $('.navTrigger').click(function () {
        $(this).toggleClass('active');
        console.log("Clicked menu");
        $("#mainListDiv").toggleClass("show_list");
        $("#mainListDiv").fadeIn();
    });

    // Function to handle the navbar shrink effect on scroll
    $(window).scroll(function() {
        if ($(document).scrollTop() > 50) {
            $('.nav').addClass('affix');
            console.log("Navbar is fixed");
        } else {
            $('.nav').removeClass('affix');
        }
    });








