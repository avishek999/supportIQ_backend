export class TextCleanerHelper {
    /**
     * Removes excessive blank lines, carriage returns, and normalizes spaces
     */
    static sanitize(text: string): string {
        return text
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/[^\S\r\n]+/g, " ")
            .trim();
    }
}
