import * as vscode from "vscode";
import { generateMock, insertFullText } from "./generateMock";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vinimockgen" is now active!');

    const disposable = vscode.commands.registerCommand(
        "vinimockgen.generateMock",
        generateMock(context)
    );

    vscode.commands.registerCommand(
        "vinimockgen.insertFullMock",
        insertFullText
    );
    context.subscriptions.push(disposable);
}

export function deactivate() {}
