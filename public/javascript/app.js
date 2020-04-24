window.onload = function () {
  Formio.setBaseUrl('http://localhost:3000');
  Formio.createForm(document.getElementById('formio'), {
    _id: '1234',
    display: 'form',
    title: 'foo',
    components: [
      {
        label: 'Upload',
        tableView: false,
        storage: 's3',
        webcam: false,
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
        label: 'Submit',
        showValidations: false,
        tableView: false,
        key: 'submit',
        type: 'button',
        input: true,
      },
    ],
  });
};
