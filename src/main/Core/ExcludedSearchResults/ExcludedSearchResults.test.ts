import type { EventEmitter } from "@Core/EventEmitter";
import type { SettingsManager } from "@Core/SettingsManager";
import { describe, expect, it, vi } from "vitest";
import { ExcludedSearchResults } from "./ExcludedSearchResults";

describe(ExcludedSearchResults, () => {
    it("should set the initial items from the settings manager", () => {
        const items = ["item1", "item2"];
        const getValueMock = vi.fn().mockReturnValue(items);

        const eventEmitter = <EventEmitter>{};
        const settingsManager = <SettingsManager>{
            getValue: (key, defaultValue) => getValueMock(key, defaultValue),
        };

        expect(new ExcludedSearchResults(eventEmitter, settingsManager).getExcludedIds()).toEqual(items);
        expect(getValueMock).toHaveBeenCalledWith("searchEngine.excludedItems", []);
    });

    it("should add an item", async () => {
        const getValueMock = vi.fn().mockReturnValue([]);
        const updateValueMock = vi.fn().mockReturnValue(Promise.resolve());
        const emitEventMock = vi.fn();

        const eventEmitter = <EventEmitter>{
            emitEvent: (event) => emitEventMock(event),
        };

        const settingsManager = <SettingsManager>{
            getValue: (key, defaultValue) => getValueMock(key, defaultValue),
            updateValue: (key, value) => updateValueMock(key, value),
        };

        const excludedSearchResults = new ExcludedSearchResults(eventEmitter, settingsManager);

        await excludedSearchResults.add("item1");

        expect(excludedSearchResults.getExcludedIds()).toEqual(["item1"]);
        expect(updateValueMock).toHaveBeenCalledWith("searchEngine.excludedItems", ["item1"]);
        expect(emitEventMock).toHaveBeenCalledWith("excludedSearchResultItemsUpdated");
    });

    it("should remove an item", async () => {
        const getValueMock = vi.fn().mockReturnValue(["item1"]);

        const updateValueMock = vi.fn().mockReturnValue(Promise.resolve());
        const emitEventMock = vi.fn();

        const eventEmitter = <EventEmitter>{ emitEvent: (event) => emitEventMock(event) };

        const settingsManager = <SettingsManager>{
            getValue: (key, defaultValue) => getValueMock(key, defaultValue),
            updateValue: (key, value) => updateValueMock(key, value),
        };

        const excludedSearchResults = new ExcludedSearchResults(eventEmitter, settingsManager);

        await excludedSearchResults.remove("item1");

        expect(excludedSearchResults.getExcludedIds()).toEqual([]);
        expect(updateValueMock).toHaveBeenCalledWith("searchEngine.excludedItems", []);
        expect(emitEventMock).toHaveBeenCalledWith("excludedSearchResultItemsUpdated");
    });
});