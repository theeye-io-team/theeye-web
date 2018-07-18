import App from 'ampersand-app'

const texts = {
  en: {
    title: 'Robotic Process and System Automation.',
    subtitle1: 'Start using TheEye,',
    subtitle2: 'the most flexible platform available in market.',
    listTitle: 'TheEye will let you:',
    listItem1: '- Turn any process into a button ready to be played (e.g. approval task).',
    listItem2: '- Integrate systems, processes and states in one place.',
    listItem3: '- Extinguish repetitive tasks, reduce burocracy and support calls.',
    listItem4: '- Control and operate remotely from mobile.',
    formTitle: 'Create account:',
    name: 'Name',
    email: 'Email',
    registerButton: 'Register',
    goToLogin: 'I\'m already registered.',
    goToLoginLink1: 'Back to login',
    goToLoginLink2: 'Go to login',
    nameMissing: 'Please, enter your name.',
    emailMissing: 'Please, enter your email.',
    emailInvalid: 'Invalid email',
    clientsTitle1: 'We accompany our customers',
    clientsTitle2: 'in reducing operational costs and optimizing time.',
    thanks: 'Thank you for registering!',
    success1: 'We sent you a confirmation email.',
    success2: 'Activate your account and start automating',
    success3: 'with TheEye.',
    errorTitle: 'Registration error',
    defaultError: 'An error has ocurred, please try again later.',
    usernameTaken: 'The username is taken. Please use another one.',
    emailTaken: 'The email is taken. Please use another one.',
    sendActivationEmailError: 'Error re sending activation email.',
    registerError: 'Error registering user.',
    sendUserRegistrationEmailError: 'Error sending registration email.',
    activationDefaultError: 'Account activation error, please try again later.',
    activationSuccess: 'Registration complete'
  },
  es: {
    title: 'Automatización Robótica de Procesos y Sistemas.',
    subtitle1: 'Comienza a operar con TheEye,',
    subtitle2: 'la plataforma más flexible del mercado.',
    listTitle: 'Con TheEye puedes:',
    listItem1: '- Botonizar toda operación, proceso, tarea de aprobación.',
    listItem2: '- Integrar sistemas, procesos y estados en un solo lugar.',
    listItem3: '- Disminuir la burocracia, las tareas repetitivas y el soporte.',
    listItem4: '- Controlar y operar de forma mobile.',
    formTitle: 'Cree su cuenta:',
    name: 'Nombre',
    email: 'Email',
    registerButton: 'Registrarse',
    goToLogin: 'Ya estoy registrado.',
    goToLoginLink1: 'Volver al login',
    goToLoginLink2: 'Ir al login',
    nameMissing: 'Por favor, ingresa tu nombre.',
    emailMissing: 'Por favor, ingresa tu correo electrónico.',
    emailInvalid: 'El email ingresado es inválido',
    clientsTitle1: 'Acompañamos a estas empresas,',
    clientsTitle2: 'optimizando tiempos y reduciendo costos operativos.',
    thanks: '¡Gracias por registrarte!',
    success1: 'Te enviamos un email de confirmación.',
    success2: 'Activa tu cuenta y comienza a automatizar',
    success3: 'con TheEye.',
    errorTitle: 'Error al registrarse',
    defaultError: 'Ocurrió un error, por favor reinténtelo más tarde.',
    usernameTaken: 'El nombre de usuario ya esta en uso. Por favor use uno distinto.',
    emailTaken: 'El email ya esta en uso. Por favor use uno distinto.',
    sendActivationEmailError: 'Error al enviar email de activación.',
    registerError: 'Error al registrar usuario.',
    sendUserRegistrationEmailError: 'Error al enviar email de registración.'
  }
}

module.exports = {
  getText (key) {
    return texts[App.language][key]
  }
}
