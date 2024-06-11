document
  .getElementById('trello-form')
  .addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const desc = document.getElementById('description').value;
    const start = document.getElementById('start-date').value;
    const due = document.getElementById('due-date').value;

    try {
      const response = await fetch('http://localhost:4000/api/createCard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, desc, start, due }),
      });
      const data = await response.json();
      console.log(data, 'okay done');
      if (response.ok) {
        alert('Card created successfully!');
      } else {
        alert('Error creating card.');
      }
    } catch (err) {
      console.log(err);
    }
  });
