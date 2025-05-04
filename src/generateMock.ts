import { exec } from "child_process";
import path from "path";
import * as vscode from "vscode";

var suggestionProvider: vscode.Disposable;

// java -jar target/mockgen-1.0-SNAPSHOT.jar  ~/proj/extensao/mockgen br.com.vinimockgen.presentation.classes.financial.Portfolio
export function generateMock(
    context: vscode.ExtensionContext,
    outputChanel: vscode.OutputChannel
) {
    return async () => {
        const symbol: vscode.SymbolInformation | null =
            await vscode.commands.executeCommand(
                "vinimockgen.listWorkspaceSymbols"
            );

        outputChanel.appendLine(
            `[INFO] Selected symbol: ${JSON.stringify(symbol)}`
        );

        if (symbol === null) {
            return;
        }

        if (vscode.workspace.workspaceFolders === undefined) {
            outputChanel.appendLine(`[DEBUG] No workspace open.`);
            return;
        }

        const jarPath = path.join(
            context.extensionPath,
            "src",
            "mockgen-1.0-SNAPSHOT.jar"
        );
        const classPath = `${symbol.containerName}.${symbol.name}`;
        const command = `java -jar "${jarPath}" ${vscode.workspace.workspaceFolders[0].uri.path} ${classPath} `;

        outputChanel.appendLine(`[INFO] JAR Command: ${command}`);

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(
                    `Error generating mock: ${stderr}`
                );
                outputChanel.appendLine(
                    `[ERROR]: Error generating mock: ${stderr}`
                );
                return;
            }

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage(`Text editor not activated.`);
                return;
            }

            suggestionProvider =
                vscode.languages.registerInlineCompletionItemProvider(
                    { language: "java" },
                    {
                        provideInlineCompletionItems(
                            document,
                            position,
                            context,
                            token
                        ) {
                            const range = new vscode.Range(position, position);
                            const slicedSuggestion =
                                stdout.slice(0, 500) + "...";

                            const item = new vscode.InlineCompletionItem(
                                slicedSuggestion,
                                range
                            );

                            item.command = {
                                command: "vinimockgen.insertFullMock",
                                title: "Insert full mock suggestion on code editor",
                                arguments: [position, stdout],
                            };

                            return [item];
                        },
                    }
                );

            context.subscriptions.push(suggestionProvider);

            await vscode.commands.executeCommand(
                "editor.action.inlineSuggest.trigger"
            );
        });
    };
}

export async function insertFullText(
    startPosition: vscode.Position,
    originalText: string
) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    await editor.edit((editBuilder) => {
        const end = editor.selection.active;
        editBuilder.replace(new vscode.Range(startPosition, end), originalText);
    });

    suggestionProvider.dispose();
}
