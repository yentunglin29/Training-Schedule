document.getElementById('courseForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const course = {
    title: formData.get('title'),
    topic: formData.get('topic'),
    content: formData.get('content'),
    duration: parseInt(formData.get('duration')),
    presenter: formData.get('presenter')
  };

  fetch('/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(course),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(data => console.log('Saved:', data))
  .catch(error => console.error('Error:', error));
});
