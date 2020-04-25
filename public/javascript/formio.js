/* eslint-disable no-undef */
window.onload = function () {
  // TODO use configuration variables (w/ pug ??)
  const baseUrl = 'http://localhost:3000';
  Formio.setBaseUrl(baseUrl);
  Formio.setProjectUrl(baseUrl);
  Formio.createForm(document.getElementById('formio'), {
    _id: '1234',
    display: 'form',
    title: 'foo',
    components: [
      {
        label: 'Email',
        placeholder: 'Email',
        hideLabel: true,
        spellcheck: true,
        tableView: true,
        calculateServer: false,
        key: 'email',
        type: 'textfield',
        input: true,
        hideOnChildrenHidden: false,
        validate: {
          required: true,
        },
      },
      {
        label: 'Upload',
        filePattern: '.mp3,.wav',
        tableView: false,
        storage: 's3',
        webcam: false,
        validate: {
          required: true,
        },
        fileTypes: [
          {
            label: '',
            value: '',
          },
        ],
        calculateServer: false,
        key: 'upload',
        type: 'file',
        input: true,
        hideLabel: true,
      },
      {
        label: 'Select',
        tableView: true,
        data: {
          values: [
            {
              label: '2 stems',
              value: '2stems',
            },
            {
              label: '4 stems',
              value: '4stems',
            },
            {
              label: '5 stems',
              value: '5stems',
            },
          ],
        },
        selectThreshold: 0.3,
        calculateServer: false,
        validate: {
          required: true,
        },
        key: 'model',
        type: 'select',
        indexeddb: {
          filter: {},
        },
        input: true,
        defaultValue: '2stems',
      },
      {
        type: 'button',
        label: 'Submit',
        key: 'submit',
        disableOnInvalid: true,
        input: true,
        tableView: false,
      },
    ],
  })
    .then((form) => {
    // Prevent the submission from going to the form.io server.
      // eslint-disable-next-line no-param-reassign
      form.nosubmit = true;

      // Triggered when they click the submit button.
      form.on('submit', ({ data }) => {
        console.log(data);
        return fetch(`${baseUrl}/api/split`, {
          body: JSON.stringify({
            ...data,
            file: data.upload[0].key,
          }),
          headers: {
            'content-type': 'application/json',
          },
          method: 'POST',
          mode: 'cors',
        })
          .then((response) => {
            form.emit('submitDone', data);
            response.json();
          });
      });
    });
};
