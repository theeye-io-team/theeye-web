import App from 'ampersand-app'

const texts = {
  en: {
    headerTitle: 'Robotic Process and System Automation.',
    title: 'TheEye account activation',
    subtitle: 'Enter your credentials:',
    btnRegister: 'Register',
    btnNext: 'Next',
    orgTitle: 'Enter your organization name:',
    btnFinish: 'Finish',
    organization: 'Organization name',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm password',
    usernameMissing: 'Please, enter your username.',
    passwordLengthError: 'Must have at least 8 characters',
    passwordMatchError: 'Password does not match',
    usernameTaken: 'The username is taken. Please use another one.',
    emailTaken: 'The email is taken. Please use another one.',
    sendActivationEmailError: 'Error re sending activation email.',
    registerError: 'Error registering user.',
    sendUserRegistrationEmailError: 'Error sending registration email.',
    defaultError: 'Account activation error, please try again later.',
    success: 'Registration complete!',
    organizationInUse: 'Organization name already in use.'
  },
  es: {
    headerTitle: 'Automatización Robótica de Procesos y Sistemas.',
    title: 'Activa tu cuenta en TheEye',
    subtitle: 'Ingresa tus credenciales:',
    btnNext: 'Siguiente',
    orgTitle: 'Escribe el nombre de tu organizaci&oacute;n:',
    btnFinish: 'Finalizar',
    organization: 'Nombre de la organización',
    username: 'Nombre de usuario',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    usernameMissing: 'Por favor, ingresa un nombre de usuario',
    passwordLengthError: 'Debe tener al menos 8 caracteres',
    passwordMatchError: 'Las contraseñas no coinciden',
    usernameTaken: 'El nombre de usuario ya esta en uso. Por favor use uno distinto.',
    emailTaken: 'El email ya esta en uso. Por favor use uno distinto.',
    sendActivationEmailError: 'Error al enviar email de activación.',
    registerError: 'Error al registrar usuario.',
    sendUserRegistrationEmailError: 'Error al enviar email de registración.',
    defaultError: 'Error al activar cuenta, por favor reinténtelo más tarde.',
    success: 'El proceso de registraci&oacute;n ha finalizado con exito!',
    organizationInUse: 'Nombre de organización en uso.'
  }
}

module.exports = {
  getText (key) {
    return texts[App.language][key]
  }
}
