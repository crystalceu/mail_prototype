document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      var elements = "";
      for (i=0; i<emails.length; i++) {
        elements += `<div class="row" onclick="load_mail(${emails[i]['id']})" id="mail-view" style="border: 1px solid rgb(0, 0, 0); padding: 0 5px 0 5px; text-align:center; cursor: pointer;">
                      <p class="font-weight-bold">${emails[i]['sender']} &nbsp &nbsp</p>
                      <p>${emails[i]['subject']}</p>
                      <p class="text text-muted" style="margin-left: auto;">${emails[i]['timestamp']}</p>
                    </div>`;
      }

      var container = document.querySelector('#emails-view');
      var div = document.createElement('div');
      div.innerHTML = elements;
      container.insertAdjacentElement('beforeend',div);

      // ADD querySelectorListener, if click on mail then render this mail  
  });

}

function load_mail(mail_id) {
  fetch(`/emails/${mail_id}`)
  .then(response => response.json())
  .then(email => {
    var elements = `<div style="display:inline-flex;">
                      <div>
                        <p class="font-weight-bold" style="margin:0;">From: ${email['sender']}</p>
                        <p class="font-weight-bold" style="margin:0;">To: ${email['recipients']}</p>
                        <p class="font-weight-bold" style="margin:0;">Subject: ${email['subject']}</p>
                        <p class="font-weight-bold" style="margin:0;">Timestamp: ${email['timestamp']}</p>
                        <button onclick="reply_mail(${email['id']})" class="btn btn-sm btn-outline-primary">Reply</button>
                      </div>
                      <div style="/*display: flex; gap: 3px; flex-direction: column; */vertical-align:top; margin-left:auto;">`;
    console.log(email['archived']);
    if (email['archived']) {
      elements += `<button onclick="unarchive_mail(${email['id']})" class="btn btn-sm btn-info">Archived</button>`;
    }
    else {
      elements += `<button onclick="archive_mail(${email['id']})" class="btn btn-sm btn-outline-info">Archive</button>`;
    }

    /*if (email['read']) {
      elements += `<button class="btn btn-sm btn-info">Read</button>`;
    }
    else {
      elements += `<button class="btn btn-sm btn-outline-info">Read</button>`;
    }*/

    elements += ` </div>
                </div>
                <div>
                  <hr>
                  <p>${email['body']}</p>
                </div>`;

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.getElementById('email-view').innerHTML = "";
    var container = document.querySelector('#email-view');
    var div = document.createElement('div');
    div.innerHTML = elements;
    container.insertAdjacentElement('beforeend',div);

  });
}

function archive_mail(mail_id) {
  fetch(`/emails/${mail_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  });
  load_mailbox('inbox');
}

function unarchive_mail(mail_id) {
  fetch(`/emails/${mail_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  });
  load_mailbox('inbox');
}

function reply_mail(mail_id) {
  fetch(`/emails/${mail_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    compose_email();
    document.querySelector('#compose-recipients').value = `${email['sender']}`;
    if (email['subject'].slice(0,3) === 'Re:') {
      document.querySelector('#compose-subject').value = `${email['subject']}`;
    }
    else {
      document.querySelector('#compose-subject').value = `Re: ${email['subject']}`;
    }
    document.querySelector('#compose-body').value = `On ${email['timestamp']} ${email['sender']} wrote: ${email['body']}`;
});
}