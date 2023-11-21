import type { CommandlineUtility } from "@common/CommandlineUtility";
import type { FileSystemUtility } from "@common/FileSystemUtility";
import type { PluginCacheFolder } from "@common/PluginCacheFolder";
import type { SettingsManager } from "@common/SettingsManager";
import type { App } from "electron";
import { join } from "path";
import { Application } from "../Application";
import type { ApplicationRepository } from "../ApplicationRepository";
import type { WindowsApplicationRetrieverResult } from "./WindowsApplicationRetrieverResult";
import { usePowershellScripts } from "./usePowershellScripts";

export class WindowsApplicationRepository implements ApplicationRepository {
    public constructor(
        private readonly pluginCacheFolder: PluginCacheFolder,
        private readonly fileSystemUtility: FileSystemUtility,
        private readonly commandlineUtility: CommandlineUtility,
        private readonly settingsManager: SettingsManager,
        private readonly app: App,
    ) {}

    public async getApplications(): Promise<Application[]> {
        const stdout = await this.executeTemporaryPowershellScriptWithOutput(
            this.getPowershellScript(),
            join(this.pluginCacheFolder.path, "WindowsApplicationSearch.temp.ps1"),
        );

        const windowsApplicationRetrieverResults = <WindowsApplicationRetrieverResult[]>JSON.parse(stdout);

        return windowsApplicationRetrieverResults.map(
            ({ BaseName, FullName, IconFilePath }) => new Application(BaseName, FullName, IconFilePath),
        );
    }

    private async executeTemporaryPowershellScriptWithOutput(script: string, filePath: string): Promise<string> {
        await this.fileSystemUtility.writeTextFile(script, filePath);

        const stdout = await this.commandlineUtility.executeCommandWithOutput(
            `powershell -NoProfile -NonInteractive -ExecutionPolicy bypass -File "${filePath}"`,
        );

        await this.fileSystemUtility.removeFile(filePath);

        return stdout;
    }

    private getPowershellScript(): string {
        const folderPaths = this.settingsManager
            .getPluginSettingByKey("ApplicationSearch", "windowsFolders", this.getDefaultFolderPaths())
            .map((folderPath) => `'${folderPath}'`)
            .join(",");

        const fileExtensions = this.settingsManager
            .getPluginSettingByKey("ApplicationSearch", "windowsFileExtensions", this.getDefaultFileExtensions())
            .map((fileExtension) => `'*.${fileExtension}'`)
            .join(",");

        const { extractShortcutPowershellScript, getWindowsAppsPowershellScript } = usePowershellScripts();

        return `
            ${extractShortcutPowershellScript}
            ${getWindowsAppsPowershellScript}

            Get-WindowsApps -FolderPaths ${folderPaths} -FileExtensions ${fileExtensions} -AppIconFolder '${this.pluginCacheFolder.path}';`;
    }

    private getDefaultFolderPaths(): string[] {
        return [
            "C:\\ProgramData\\Microsoft\\Windows\\Start Menu",
            join(this.app.getPath("home"), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu"),
        ];
    }

    private getDefaultFileExtensions(): string[] {
        return ["lnk"];
    }
}