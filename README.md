Proyecto parea facilitar el compilado y grabado de programa para la stm32 blue pill

-   Para poder instalar esta extension primero necesitas tener el compilador arm-none-eabi-gcc instalado
    y tenerlo agregado al path.
-   Necesitas tener instalado Git bash agregarlo al path para poder llamarlo desde la cmd de windows.
-   Se necesita instalar vs code.

-   En la carpeta resources se tienen todos los archivos necesarios. Carpetas y sus rutas de instalacion:

    -   Mover a "C:\" las siguientes carpetas:

        - stlink-1.8.0-win32
        - stm32f103c8t6
    
    -   Mover a "C:\Program Files (x86)\" las siguientes carpetas:

        - stlink



Para la instalacion de un .vsix necesitaras algunas dependencias, se recomienda instalar las que aun no se tenga.

-   Para la instalacion de la extension, se habre un cmd y se hace un "cd" a la ruta donde lo tengas        descargado, posteriormente se ejecuta el siguiente comando:

                "code --install-extension stm32-Helper-0.0.1.vsix"