const overlay = document.getElementById('unique-overlay');
        const board = document.getElementById('unique-board');
        const addNoteBtn = document.getElementById('unique-add-note-btn');
        const modal = document.getElementById('unique-modal');
        const modalImage = document.getElementById('unique-modal-image');
        const closeModal = document.getElementById('unique-close-modal');

        // Add new sticky note
        addNoteBtn.addEventListener('click', () => {
            const newNote = document.createElement('div');
            newNote.classList.add('unique-sticky-note');
            newNote.innerHTML = `<img src="https://via.placeholder.com/150" alt="New Image">`;
            board.appendChild(newNote);

            newNote.addEventListener('click', () => {
                modalImage.src = newNote.querySelector('img').src;
                modal.classList.add('active');
            });
        });

        // Add event listeners to sticky notes
        document.querySelectorAll('.unique-sticky-note').forEach((note) => {
            note.addEventListener('click', () => {
                modalImage.src = note.querySelector('img').src;
                modal.classList.add('active');
            });
        });

        // Close modal
        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Close modal when clicking outside the image
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Hide board when clicking overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });