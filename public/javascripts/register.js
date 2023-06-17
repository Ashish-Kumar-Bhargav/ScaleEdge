
  function validateForm() {
      var companyName = document.getElementById('company_name').value;
      var userName = document.getElementById('name').value;
      var address = document.getElementById('address').value;
      var email = document.getElementById('email').value;
      var mobile = document.getElementById('mobile').value;
      var password = document.getElementById('password').value;
      var confirmPassword = document.getElementById('cpassword').value;

      if (
        companyName === '' ||
        userName === '' ||
        address === '' ||
        email === '' ||
        mobile === '' ||
        password === '' ||
        confirmPassword === ''
      ) {
        showAlert('Please fill in all fields.');
        return false;
      }

      if (password !== confirmPassword) {
        showAlert('Passwords do not match.');
        return false;
      }

      if (mobile.length !== 10 || isNaN(mobile)) {
        showAlert('Mobile number should have exactly 10 digits.');
        return false;
      }

      showSuccessAlert('Registration successful. Welcome, ' + userName + '!');

    
      return false;
    }

    function showAlert(message) {
      Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
      });
    }

    function showSuccessAlert(message) {
  Swal.fire({
    title: 'Success',
    text: message,
    icon: 'success',
    timer: 5000,
    timerProgressBar: true,
    showConfirmButton: false, // Disable the "OK" button
    allowOutsideClick: false, // Prevent clicking outside the modal
  }).then(() => {
    document.getElementById('companyForm').submit(); // Submit the form
  });
}
