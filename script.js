document.addEventListener('DOMContentLoaded', function() {
  // Fetch and populate titles
  fetch('/titles')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
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

  // Fetch and populate presenters
  fetch('/presenters')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(presenters => {
      const presenterList = document.getElementById('presenterList');
      presenterList.innerHTML = ''; // Clear any existing content
      presenters.forEach(presenter => {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'form-check';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.id = `presenter-${presenter}`;
        checkbox.value = presenter;
        checkbox.name = 'presenter';

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `presenter-${presenter}`;
        label.textContent = presenter;

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);
        presenterList.appendChild(checkboxWrapper);
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

    fetch('/add-course', { // Replace with your API endpoint
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

