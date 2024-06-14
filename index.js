// index.js
document.getElementById('course-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const course = {
        courseTitle: document.getElementById('courseTitle').value,
        topic: document.getElementById('topic').value,
        content: document.getElementById('content').value,
        duration: document.getElementById('duration').value,
        presenter: document.getElementById('presenter').value
    };

    // Save data to localStorage or handle it as needed
    localStorage.setItem('courses', JSON.stringify(course));
    alert('Course information saved!');
});
