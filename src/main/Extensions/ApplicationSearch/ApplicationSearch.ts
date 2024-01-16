import type { OperatingSystem, SearchResultItem } from "@common/Core";
import type { DependencyInjector } from "../../Core/DependencyInjector";
import type { Extension } from "../../Core/Extension";
import type { ApplicationRepository } from "./ApplicationRepository";
import type { Settings } from "./Settings";

export class ApplicationSearch implements Extension {
    public readonly id = "ApplicationSearch";
    public readonly name = "Application Search";
    public readonly nameTranslationKey = "extension[ApplicationSearch].extensionName";

    public constructor(
        private readonly applicationRepository: ApplicationRepository,
        private readonly settings: Settings,
    ) {}

    public async getSearchResultItems(): Promise<SearchResultItem[]> {
        const applications = await this.applicationRepository.getApplications();
        return applications.map((application) => application.toSearchResultItem());
    }

    public isSupported(dependencyInjector: DependencyInjector): boolean {
        const currentOperatingSystem = dependencyInjector.getInstance<OperatingSystem>("OperatingSystem");
        const supportedOperatingSystems: OperatingSystem[] = ["Windows", "macOS"];
        return supportedOperatingSystems.includes(currentOperatingSystem);
    }

    public getSettingDefaultValue<T>(key: string): T {
        return this.settings.getDefaultValue<T>(key);
    }
}
