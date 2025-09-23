"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/*
function compilar() {
    const config = vscode.workspace.getConfiguration('stm32Helper');
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No hay archivo abierto.');
        return;
    }

    const projectPath = config.get<string>('Make');
    if (!projectPath) {
        vscode.window.showErrorMessage('No se definió la ruta del Makefile en la configuración.');
        return;
    }

    const filePath = editor.document.fileName;
    const folderPath = path.dirname(filePath);

    const output = vscode.window.createOutputChannel('STM32 Build');
    output.show(true);
    output.appendLine(`Compilando proyecto en: ${folderPath}\n`);

    // --- Crear Makefile si no existe ---
    const makefilePath = path.join(folderPath, 'Makefile');
    if (!fs.existsSync(makefilePath)) {
        const makefileContent = `
# Makefile de ejemplo
BINARY      = main
SRCFILES    = main.c
LDSCRIPT    = stm32f103c8t6.ld

include ${projectPath}/../Makefile.incl
include ${projectPath}/Makefile.rtos
        `.trim();

        try {
            fs.writeFileSync(makefilePath, makefileContent, { encoding: 'utf-8' });
            vscode.window.showInformationMessage(`Makefile creado en: ${makefilePath}`);
        } catch (err: any) {
            vscode.window.showErrorMessage(`Error creando Makefile: ${err.message}`);
            return;
        }
    }

    // --- Ejecutar make ---
    const cmd = `make PROJS=${folderPath}`;
    exec(cmd, { cwd: projectPath }, (error, stdout, stderr) => {
        output.appendLine(stdout);
        if (stderr) output.appendLine(stderr);

        if (error) {
            vscode.window.showErrorMessage(`Error al compilar: ${error.message}`);
        } else {
            vscode.window.showInformationMessage('Compilación completada ✅');

            // --- Crear binario ---
            const cmdBin = `arm-none-eabi-objcopy -O binary main.elf main.bin`;
            exec(cmdBin, { cwd: folderPath }, (error, stdout, stderr) => {
                output.appendLine(stdout);
                if (stderr) output.appendLine(stderr);

                if (error) {
                    vscode.window.showErrorMessage(`Error al crear binario: ${error.message}`);
                } else {
                    vscode.window.showInformationMessage('Archivo binario creado ✅');
                }
            });
        }
    });
}

*/
function compilar() {
    return new Promise((resolve, reject) => {
        const config = vscode.workspace.getConfiguration('stm32Helper');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No hay archivo abierto.');
            return reject();
        }
        const projectPath = config.get('Make');
        if (!projectPath) {
            vscode.window.showErrorMessage('No se definió la ruta del Makefile en la configuración.');
            return reject();
        }
        const filePath = editor.document.fileName;
        const folderPath = path.dirname(filePath);
        const output = vscode.window.createOutputChannel('STM32 Build');
        output.show(true);
        output.appendLine(`Compilando proyecto en: ${folderPath}\n`);
        const linkerPath = path.join(folderPath, 'stm32f103c8t6.ld');
        if (!fs.existsSync(linkerPath)) {
            const linkerContent = `
/*
 * This file is part of the libopencm3 project.
 *
 * Copyright (C) 2009 Uwe Hermann <uwe@hermann-uwe.de>
 *
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 */

/* Linker script for ST STM32F103C8T6 */

MEMORY
{
	rom (rx) : ORIGIN = 0x08000000, LENGTH = 64K
	ram (rwx) : ORIGIN = 0x20000000, LENGTH = 20K
}

/* Enforce emmition of the vector table. */
EXTERN (vector_table)

/* Define the entry point of the output file. */
ENTRY(reset_handler)

/* Define sections. */
SECTIONS
{
	.text : {
		*(.vectors)	/* Vector table */
		*(.text*)	/* Program code */
		. = ALIGN(4);
		*(.rodata*)	/* Read-only data */
		. = ALIGN(4);
	} >rom

	/* C++ Static constructors/destructors, also used for __attribute__
	 * ((constructor)) and the likes */
	.preinit_array : {
		. = ALIGN(4);
		__preinit_array_start = .;
		KEEP (*(.preinit_array))
		__preinit_array_end = .;
	} >rom
	.init_array : {
		. = ALIGN(4);
		__init_array_start = .;
		KEEP (*(SORT(.init_array.*)))
		KEEP (*(.init_array))
		__init_array_end = .;
	} >rom
	.fini_array : {
		. = ALIGN(4);
		__fini_array_start = .;
		KEEP (*(.fini_array))
		KEEP (*(SORT(.fini_array.*)))
		__fini_array_end = .;
	} >rom

	/*
	 * Another section used by C++ stuff, appears when using newlib with
	 * 64bit (long long) printf support
	 */
	.ARM.extab : {
		*(.ARM.extab*)
	} >rom
	.ARM.exidx : {
		__exidx_start = .;
		*(.ARM.exidx*)
		__exidx_end = .;
	} >rom

	. = ALIGN(4);
	_etext = .;

	.data : {
		_data = .;
		*(.data*)	/* Read-write initialized data */
		. = ALIGN(4);
		_edata = .;
	} >ram AT >rom
	_data_loadaddr = LOADADDR(.data);

	.bss : {
		*(.bss*)	/* Read-write zero initialized data */
		*(COMMON)
		. = ALIGN(4);
		_ebss = .;
	} >ram

	/*
	 * The .eh_frame section appears to be used for C++ exception handling.
	 * You may need to fix this if you're using C++.
	 */
	/DISCARD/ : { *(.eh_frame) }

	. = ALIGN(4);
	end = .;
}

PROVIDE(_stack = ORIGIN(ram) + LENGTH(ram));


            `.trim();
            try {
                fs.writeFileSync(linkerPath, linkerContent, { encoding: 'utf-8' });
                vscode.window.showInformationMessage(`Linker file creado en: ${linkerPath}`);
            }
            catch (err) {
                vscode.window.showErrorMessage(`Error creando Makefile: ${err.message}`);
                return reject();
            }
        }
        const makefilePath = path.join(folderPath, 'Makefile');
        if (!fs.existsSync(makefilePath)) {
            const makefileContent = `
# Makefile de ejemplo
BINARY      = main
SRCFILES	= main.c rtos/heap_4.c rtos/list.c rtos/port.c rtos/tasks.c rtos/opencm3.c
LDSCRIPT    = stm32f103c8t6.ld

include ${projectPath}/../Makefile.incl
include ${projectPath}/Makefile.rtos
            `.trim();
            try {
                fs.writeFileSync(makefilePath, makefileContent, { encoding: 'utf-8' });
                vscode.window.showInformationMessage(`Makefile creado en: ${makefilePath}`);
            }
            catch (err) {
                vscode.window.showErrorMessage(`Error creando Makefile: ${err.message}`);
                return reject();
            }
        }
        const cmd = `make PROJS=${folderPath}`;
        (0, child_process_1.exec)(cmd, { cwd: projectPath }, (error, stdout, stderr) => {
            output.appendLine(stdout);
            if (stderr)
                output.appendLine(stderr);
            if (error) {
                vscode.window.showErrorMessage(`Error al compilar: ${error.message}`);
                return reject();
            }
            vscode.window.showInformationMessage('Compilación completada ✅');
            const cmdBin = `arm-none-eabi-objcopy -O binary main.elf main.bin`;
            (0, child_process_1.exec)(cmdBin, { cwd: folderPath }, (error, stdout, stderr) => {
                output.appendLine(stdout);
                if (stderr)
                    output.appendLine(stderr);
                if (error) {
                    vscode.window.showErrorMessage(`Error al crear binario: ${error.message}`);
                    return reject();
                }
                vscode.window.showInformationMessage('Archivo binario creado ✅');
                resolve();
            });
        });
    });
}
function flash() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No hay archivo abierto.');
        return;
    }
    const filePath = editor.document.fileName;
    const folderPath = path.dirname(filePath);
    const binPath = path.join(folderPath, "main.bin");
    const output = vscode.window.createOutputChannel('STM32 Flash');
    output.show(true);
    output.appendLine(`Flasheando: ${binPath}\n`);
    const cmd = `st-flash write ${binPath} 0x8000000`;
    (0, child_process_1.exec)(cmd, { cwd: folderPath }, (error, stdout, stderr) => {
        output.appendLine(stdout);
        if (stderr)
            output.appendLine(stderr);
        if (error) {
            vscode.window.showErrorMessage(`Error al flashear: ${error.message}`);
        }
        else {
            vscode.window.showInformationMessage('Flash completado ✅');
        }
    });
}
async function compilar_flash() {
    try {
        await compilar();
        flash();
    }
    catch {
        vscode.window.showErrorMessage("Error en compilación, no se puede flashear.");
    }
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('stm32-helper.compile', compilar), vscode.commands.registerCommand('stm32-helper.flash', flash), vscode.commands.registerCommand('stm32-helper.compileAndFlash', compilar_flash));
}
//# sourceMappingURL=extension.js.map