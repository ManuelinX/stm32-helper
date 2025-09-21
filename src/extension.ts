import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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

function compilar(): Promise<void> {
    return new Promise((resolve, reject) => {
        const config = vscode.workspace.getConfiguration('stm32Helper');
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No hay archivo abierto.');
            return reject();
        }

        const projectPath = config.get<string>('Make');
        if (!projectPath) {
            vscode.window.showErrorMessage('No se definió la ruta del Makefile en la configuración.');
            return reject();
        }

        const filePath = editor.document.fileName;
        const folderPath = path.dirname(filePath);

        const output = vscode.window.createOutputChannel('STM32 Build');
        output.show(true);
        output.appendLine(`Compilando proyecto en: ${folderPath}\n`);

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
            } catch (err: any) {
                vscode.window.showErrorMessage(`Error creando Makefile: ${err.message}`);
                return reject();
            }
        }

        const cmd = `make PROJS=${folderPath}`;
        exec(cmd, { cwd: projectPath }, (error, stdout, stderr) => {
            output.appendLine(stdout);
            if (stderr) output.appendLine(stderr);

            if (error) {
                vscode.window.showErrorMessage(`Error al compilar: ${error.message}`);
                return reject();
            }

            vscode.window.showInformationMessage('Compilación completada ✅');

            const cmdBin = `arm-none-eabi-objcopy -O binary main.elf main.bin`;
            exec(cmdBin, { cwd: folderPath }, (error, stdout, stderr) => {
                output.appendLine(stdout);
                if (stderr) output.appendLine(stderr);

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

    exec(cmd, { cwd: folderPath }, (error, stdout, stderr) => {
        output.appendLine(stdout);
        if (stderr) output.appendLine(stderr);

        if (error) {
            vscode.window.showErrorMessage(`Error al flashear: ${error.message}`);
        } else {
            vscode.window.showInformationMessage('Flash completado ✅');
        }
    });
}

async function compilar_flash() {
    try {
        await compilar();
        flash();
    } catch {
        vscode.window.showErrorMessage("Error en compilación, no se puede flashear.");
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('stm32-helper.compile', compilar),
        vscode.commands.registerCommand('stm32-helper.flash', flash),
		vscode.commands.registerCommand('stm32-helper.compileAndFlash', compilar_flash)
    );
}
