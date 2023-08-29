import { exec } from "child_process";
import { CommandlineUtility } from "./CommandlineUtility";

export class RealCommandlineUtility implements CommandlineUtility {
    public executeCommandWithOutput(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else if (stderr) {
                    reject(stderr);
                } else {
                    resolve(stdout.toString());
                }
            });
        });
    }

    public async executeCommand(command: string): Promise<void> {
        await this.executeCommandWithOutput(command);
    }
}