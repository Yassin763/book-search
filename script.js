let books = []
const modal = document.querySelector('.book-modal')
const modalImage = document.querySelector('.modal-image img')
const modalTitle = document.querySelector('.modal-info h2')
const modalAuthor = document.querySelector('.author')
const Author = document.querySelector('.modal-info span')
const modalYear = document.querySelector('.year')
const modalDescription = document.querySelector('.description')
async function getBooks() {
    const inputValue = document.querySelector('input').value
    const query = encodeURIComponent(inputValue)
    const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=10`)
    const data = await response.json()
    return data.docs

}
async function showBooks(e) {
    e.preventDefault()
    const inputValue = document.querySelector('input').value
    if (!inputValue.trim()) return
    try {
        showLoading()
        books = await getBooks()
        if (books.length !== 0) {
            const row = document.querySelector('.row')
            row.classList.remove('text-center');
            row.innerHTML = ""
            for (let book of books) {
                let image = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : `https://placehold.co/220x320?text=No+Cover`;
                const div = document.createElement('div')
                div.className = 'col-lg-3 col-md-6 col-sm-12'
                div.innerHTML = `
                        <div class="card book-card m-3" data-id="${book.key}" style="width: 220px; height: 400px; background-color: #F5F0EB; border: none; cursor:pointer;">
                <img src="${image}"  style="width: 100% ; height: 80% ; object-fit: cover;" class="card-img-top" alt="${book.title}">
                <div class="card-body my-1">
                    <h6 class="card-text fw-semibold">${book.title}</h6>
                    <h6 class="card-author">${book.author_name?.[0] || 'Unknown Author'} </h6>
                </div>
                </div>
            `
                row.appendChild(div)

            }

        } else {
            const row = document.querySelector('.row')
            row.classList.add('text-center')
            row.innerHTML = `
            <div class="not-found ">
                <i class="bi bi-question-circle fs-1"></i>
                <h2>Nothing found.</h2>
                <p>We couldn’t find any books matching your search.</p>
                <button id="clearSearch" type="button" class="btn btn-outline-dark rounded-4 px-4">
                    clear search
                </button>
            </div>
`;

        }
    } catch (error) {
        console.log(error)
        showError()
    }

}
const errorAlert = document.getElementById("errorAlert");
const closeError = document.getElementById("closeError");

function showError(message = "We couldn't load the books. Please try again.") {
    errorAlert.querySelector("p").textContent = message;

    errorAlert.classList.add("show");

    setTimeout(() => {
        errorAlert.classList.remove("show");
    }, 4000);
}

closeError.addEventListener("click", () => {
    errorAlert.classList.remove("show");
});
function showLoading() {
    const row = document.querySelector('.row');

    row.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const div = document.createElement('div');

        div.className = 'col-lg-3 col-md-6 col-sm-12';

        div.innerHTML = `
            <div class="card skeleton-card m-3">

                <div class="skeleton skeleton-image"></div>

                <div class="card-body my-1">

                    <div class="skeleton skeleton-title"></div>

                    <div class="skeleton skeleton-author"></div>

                </div>

            </div>
        `;

        row.appendChild(div);
    }
}
async function openBookModal(id) {
    const book = books.find(book => book.key == id)
    if (!book) return;
    let image = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : `https://placehold.co/220x320?text=No+Cover`;
    modalImage.src = image
    modalTitle.textContent = book.title
    modalAuthor.textContent = book.author_name?.[0] || 'Unknown Author'
    Author.textContent = book.author_name?.[0] || 'Unknown Author'
    modalYear.textContent =
        book.first_publish_year || "Unknown Year";

    modalDescription.textContent =
        "Generating description...";

    modal.style.display = "flex";

    try {

const response = await fetch("https://book-search-alpha-gold.vercel.app/api/book-description", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        title: book.title,
        author: book.author_name?.[0],
        description: book.first_sentence?.[0]
    })
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.error || "Failed to generate description");
}
modalDescription.textContent = data.description;

    } catch (error) {
        console.log(error);
        showError(error.message);
    }
}

const row = document.querySelector('.row');
const form = document.querySelector('form')
const input = document.querySelector('input');
const cancelBtn = document.querySelector('.modal-close')
form.addEventListener('submit', showBooks)
row.addEventListener('click', function (e) {
    if (e.target.id === 'clearSearch') {
        input.value = '';
        row.innerHTML = '';
    }

    const card = e.target.closest('.book-card')
    if (!card) return;
    const id = card.dataset.id
    openBookModal(id)
});
cancelBtn.addEventListener('click', function () {
    modal.style.display = "none";
})
modal.addEventListener('click', function (e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
document.addEventListener('keydown' , function(e) {
    if(e.key === 'Escape'){
        modal.style.display = 'none'
    }
})