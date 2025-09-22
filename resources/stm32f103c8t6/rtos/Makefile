######################################################################
#  Makefile for top level rtos subdirectory
######################################################################

######################################################################
#  Makefile for top level rtos subdirectory (modificado)
######################################################################
#creo que no va - antes de safeflags
# Lista de proyectos por defecto
PROJS = blinky2 #timer1 timer2 uart uart2 uart3 usbcdc usbbulk i2c-pcf8574 winbond rtc rtc2

# Si se pasa PROJS desde la línea de comando, se usa; si no, se usa la lista por defecto
ifeq ($(PROJS),)
    PROJS := blinky2
endif

# Extrae solo el nombre de la carpeta (quita la ruta)
PROJECTS := $(foreach p,$(PROJS),$(notdir $(p)))
SAFEFLAGS := $(filter-out PROJS=%,$(MAKEFLAGS))
# Target por defecto
all: libwwg
	@echo "Compilando proyectos: $(PROJECTS)"
	for proj in $(PROJECTS); do \
		echo "Compilando $$proj..."; \
		$(MAKE) $(SAFEFLAGS) -C $$PROJS ; \
	done

# Limpieza
clean:
	for proj in $(PROJECTS); do \
		$(MAKE) $(SAFEFLAGS) -C $$PROJS clean ; \
	done
	$(MAKE) $(SAFEFLAGS) -C ./libwwg clean

clobber:
	for proj in $(PROJECTS); do \
		$(MAKE) $(SAFEFLAGS) -C $$PROJS clobber ; \
	done
	$(MAKE) $(SAFEFLAGS) -C ./libwwg clean

# End

