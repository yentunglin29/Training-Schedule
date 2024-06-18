document.addEventListener('DOMContentLoaded', function() {
  // add title
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
    })
    .catch(error => console.error('Error fetching titles:', error));

  // add presenter
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
    })
    .catch(error => console.error('Error fetching presenters:', error));
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('courseForm');

  form.addEventListener('submit', event => {
    event.preventDefault();

    const durationInput = document.getElementById('duration');
    const durationValue = parseInt(durationInput.value);

    // let duration 5 - 480
    if (durationValue < 5 || durationValue > 480) {
      alert('Duration must be between 5 and 480 minutes.');
      durationInput.focus();
      return;
    }

    const formData = new FormData(form);
    const presenters = Array.from(form.querySelectorAll('input[name="presenter"]:checked')).map(checkbox => checkbox.value);

    const courseData = {
      title: formData.get('title'),
      topic: formData.get('topic'),
      content: formData.get('content'),
      duration: durationValue,
      presenter: presenters // Array of selected presenters
    };

    fetch('/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    })
    .then(response => {
      if (response.ok) {
        alert('Course added successfully!');
        form.reset(); // Reset the form
      } else {
        alert('Failed to add course.');
      }
    })
    .catch(error => console.error('Error:', error));
  });
});

