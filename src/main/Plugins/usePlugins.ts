import type { PluginDependencies } from "@common/PluginDependencies";
import type { SearchIndex } from "@common/SearchIndex";
import type { IpcMain } from "electron";
import {
    addSearchResultItemsToSearchIndex,
    getEnabledPlugins,
    getSupportedPlugins,
    subscribeToIpcMainEvents,
} from "./Helpers";
import { getAll, getAllPluginIdsEnabledByDefault } from "./Plugins";

export const usePlugins = ({
    ipcMain,
    pluginDependencies,
    searchIndex,
}: {
    ipcMain: IpcMain;
    pluginDependencies: PluginDependencies;
    searchIndex: SearchIndex;
}) => {
    const { currentOperatingSystem, settingsManager } = pluginDependencies;

    const plugins = getAll(pluginDependencies);
    const pluginIdsEnabledByDefault = getAllPluginIdsEnabledByDefault();

    const supportedPlugins = getSupportedPlugins(plugins, currentOperatingSystem);
    const enabledPlugins = getEnabledPlugins(supportedPlugins, settingsManager, pluginIdsEnabledByDefault);

    subscribeToIpcMainEvents({
        ipcMain,
        plugins: supportedPlugins,
        searchIndex,
    });

    addSearchResultItemsToSearchIndex({
        plugins: enabledPlugins,
        searchIndex,
    });
};