document.addEventListener('DOMContentLoaded', function() {
  // Load course titles
  fetch('/titles')
    .then(response => response.json())
    .then(titles => {
      const titleSelect = document.getElementById('title');
      titles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        option.text = title;
        titleSelect.add(option);
      });
    });

  // Load presenters
  fetch('/presenters')
    .then(response => response.json())
    .then(presenters => {
      const presenterSelect = document.getElementById('presenter');
      presenters.forEach(presenter => {
        const option = document.createElement('option');
        option.value = presenter;
        option.text = presenter;
        presenterSelect.add(option);
      });
    });
});

document.getElementById('courseForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const course = {
    title: formData.get('title'),
    topic: formData.get('topic'),
    content: formData.get('content'),
    duration: parseInt(formData.get('duration')),
    presenter: Array.from(formData.getAll('presenter'))
  };

  fetch('/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(course),
  })
  .then(response => response.text())
  .then(data => {
    console.log('Saved:', data);
    alert('Course saved');
  })
  .catch(error => console.error('Error:', error));
});
