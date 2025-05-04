import * as vscode from "vscode";
import { generateMock, insertFullText } from "./generateMock";
import { findSymbol } from "./symbolFinder";

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("viniMockGen");
    outputChannel.appendLine("[INFO] Starting viniMockGen extension...");

    const disposable = vscode.commands.registerCommand(
        "vinimockgen.generateMock",
        generateMock(context, outputChannel)
    );
    context.subscriptions.push(disposable);

    const insertTextDisposable = vscode.commands.registerCommand(
        "vinimockgen.insertFullMock",
        insertFullText
    );
    context.subscriptions.push(insertTextDisposable);

    const findSymbolDisposable = vscode.commands.registerCommand(
        "vinimockgen.listWorkspaceSymbols",
        findSymbol(outputChannel)
    );

    context.subscriptions.push(findSymbolDisposable);
}

export function deactivate() {}
