import * as vscode from "vscode";

export function findSymbol(
    outputChanel: vscode.OutputChannel
): () => Promise<vscode.SymbolInformation | null> {
    return () => {
        return _findSymbol(outputChanel);
    };
}

async function _findSymbol(
    outputChanel: vscode.OutputChannel
): Promise<vscode.SymbolInformation | null> {
    return new Promise((resolve) => {
        const symbolPicker = vscode.window.createQuickPick();
        symbolPicker.placeholder = "Select a class to mock...";

        symbolPicker.onDidChangeValue(async (classNameFilter) => {
            const newSymbolInfos = await listSymbols(classNameFilter);
            symbolPicker.items = newSymbolInfos.map((symbol) => ({
                label: `$(symbol-class) ${symbol.name}`,
                description: `${symbol.containerName} · ${symbol.location.uri.fsPath}`,
                symbol,
            }));
        });

        symbolPicker.onDidAccept(() => {
            const selectedItem = symbolPicker.selectedItems[0];
            const selectedSymbol: vscode.SymbolInformation = (
                selectedItem as any
            )["symbol"];

            resolve(selectedSymbol);
            symbolPicker.dispose();
        });

        symbolPicker.onDidHide(() => {
            resolve(null);
            symbolPicker.dispose();
        });
        symbolPicker.show();
    });
}

async function listSymbols(
    filterQuery: string
): Promise<vscode.SymbolInformation[]> {
    const symbols = await vscode.commands.executeCommand<
        vscode.SymbolInformation[]
    >("vscode.executeWorkspaceSymbolProvider", filterQuery);

    return symbols?.filter((sym) => sym.kind === vscode.SymbolKind.Class);
}
