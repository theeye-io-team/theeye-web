[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

# IAM - Roles y administración de acceso 

-----

## Roles by group



   | Rol         | Task     | IAM      | CRUD     | ACL's    | 
   | -----       | -----    | -----    | -----    | -----    | 
   | Onwer       | &#10003; | &#10003; | &#10003; | &#10003; | 
   | Admin       | &#10003; | -        | -        | &#10003; | 
   | Manager     | ver      | &#10003; | -        | -        | 
   | User        | ejecutar | -        | -        | -        | 
   | Viewer      | ver      | -        | -        | -        | 
   | Agent       | \*       | -        | -        | -        | 
   | Integration | \*       | -        | -        | -        | 


### Usuarios humanos


1. **owner**

    * Acceso total
    * Control total sobre organizaciones
    * Crear y modificar tareas
    * Ejecutar tareas
    * Administración de ACLs
    * Control de miembros

2. **admin**

    * Crear y modificar tareas
    * Ejecutar tareas
    * Administración de ACLs

3. **manager**

    * Control de miembros
    * Ver tareas (necesita ser ACL)
    * Ejecutar tareas (necesita ser ACL)
      
4. **user**

    * Ver tareas (necesita ser ACL)
    * Ejecutar tareas (necesita ser ACL)

5. **viewer**

    * Ver tareas (necesita ser ACL)


-----

### Usuarios bot

1. **agent**


2. **integration**


## Control de miembros

Para agregar, modificar o dar usuarios de baja en tu organización, abra el menú lateral si no está abierto, luego vaya a _Settings_ y entre en la sección _Members_

![](../../images/members.png)

Al invitar un nuevo miembro, se le solicitará elegir el rol de este usuario \(admin/user/viewer/manager\).

El rol de un miembro puede ser cambiado en cualquier momento por un manager o el owner de la organización.

-----

## ACLs

En la sección anterior se describieron los roloes y la administración de usuarios.

Los ACLs aplican diréctamente a los recursos.

Los miembros admin pueden hacer los recursos visibles para otros miembros agregándolos en como _ACL's_ en los formularios de _Task_ y _Monitor_.

Cuando a un usuario se lo agrega a la lista de ACLs ese recurso aparece disponible y accesible según el rol del miembro.

Las notificaciones se envian a todos los usuarios dentro de la lista de ACLs independientemente de su rol.

-----


## Users Domain Controller

Las instalaciones On-Premise permiten integrar el control de acceso y de autorización a un Domain Controller


### Setup

TheEye crea una copia de los perfiles de Domain Controller con los siguientes atributos:

* id

* fullname

* email

* username

* groups


El atributo de grupos es necesario para asignarle la credencial en TheEye, al igual que los ACL's y permisos.

Con el perfil creado, el usuario se identificará en el historial de actividad y en la interfaz de usuario.

Algunos **pre-requisitos** comunes para integrar un Domain Controller AD o LDAP

* Bind DN

* Bind Credentials

* TLS Certificate

Una vez configurada la integración, el sistema va a autenticar a cada request de autenticación por defecto a través del Domain Controller.

### Grupos

Para permitirle a un usuario usar TheEye, este tiene que ser asignado al grupo **theeye_users**

Los perfies de usuario se pueden controlar por el Domain controller asignandoles uno de los siguientes grupos:

  * theeye_owners     

  * theeye_admins     

  * theeye_managers    

  * theeye_users   

  * theeye_viewers

Luego sigue estos pasos para permitirle a un usuario de dominio acceder a TheEye:

#### Paso 1

En el Domain Controller agregue el grupo al usuario. 

Si al usuario se le asigna un grupo invalido, el intento de login va a ser rechazado.

#### Paso 2

Inicie sesión en la interfaz web usando un usuario con permisos de owner o manager.

Invite al usuario desde el panel de miembros de la organización.

#### Paso 3

El usuario está disponible para iniciar sesión en TheEye.
