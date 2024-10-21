const socket = io();

const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageTone = new Audio('/message-tone.mp3');

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

function sendMessage() {
  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (message === '' || name === '') {
    alert('Please enter both name and message.');
    return;
  }

  const data = {
    name: name,
    message: message,
    dateTime: new Date(),
  };

  socket.emit('message', data);
  addMessageToUI(true, data);
  messageInput.value = '';
}

socket.on('chat-message', (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  console.log(data,"datatedst");
  
  const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>
  `;

  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener('focus', () => {
  const name = nameInput.value.trim();
  if (name) {
    socket.emit('feedback', { feedback: `${name} is typing...` });
  }
});

messageInput.addEventListener('blur', () => {
  socket.emit('feedback', { feedback: '' });
});

socket.on('feedback', (data) => {
  clearFeedback();
  if (data.feedback) {
    const element = `
      <li class="message-feedback">
        <p class="feedback">${data.feedback}</p>
      </li>
    `;
    messageContainer.innerHTML += element;
  }
});

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
