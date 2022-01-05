import * as vscode from "vscode";
import { spawn } from "child_process";

export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerDocumentFormattingEditProvider("mtml", {
    provideDocumentFormattingEdits(
      document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.TextEdit[]> {
      const origText = document.getText();

      let formattedText = "";
      const mtmltidy = spawn("mtmltidy");
      mtmltidy.stdin.write(origText);
      mtmltidy.stdin.end();
      mtmltidy.stdout.on("data", (chunk) => {
        formattedText += chunk.toString("utf-8");
      });

      return new Promise<vscode.TextEdit[]>((resolve) => {
        mtmltidy.on("exit", () => {
          const textRange = document.validateRange(
            new vscode.Range(0, 0, document.lineCount, 0)
          );
          resolve([vscode.TextEdit.replace(textRange, formattedText)]);
        });
      });
    },
  });
}

export function deactivate() {}
