import { exec } from "child_process";
import path from "path";
import * as vscode from "vscode";

var suggestionProvider: vscode.Disposable;

// java -jar target/mockgen-1.0-SNAPSHOT.jar  ~/proj/extensao/mockgen br.com.vinimockgen.presentation.classes.financial.Portfolio
export function generateMock(context: vscode.ExtensionContext) {
    return async () => {
        const jarPath = path.join(
            context.extensionPath,
            "src",
            "mockgen-1.0-SNAPSHOT.jar"
        );
        const command = `java -jar "${jarPath}" ~/proj/extensao/mockgen br.com.vinimockgen.presentation.classes.financial.Portfolio`;

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(
                    `Error generating mock: ${stderr}`
                );
                return;
            }

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
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
                                title: "Insert full mock suggestion",
                                arguments: [position, slicedSuggestion, stdout],
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
    position: vscode.Position,
    preview: string,
    originalText: string
) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const numBreakLines = (preview.match("\n") || []).length;

    await editor.edit((editBuilder) => {
        const end = editor.selection.active;
        const start = new vscode.Position(end.line - numBreakLines, 0);
        editBuilder.replace(new vscode.Range(position, end), originalText);
    });

    suggestionProvider.dispose();
}
