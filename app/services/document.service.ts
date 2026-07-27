import { PDFParse } from "pdf-parse";
import axios from "axios";
import * as cheerio from "cheerio";

export class DocumentService {
    /**
     * Extracts raw text from an uploaded file buffer based on MIME type.
     */
    static async extractTextFromFile(
        fileBuffer: Buffer,
        mimeType: string
    ): Promise<string> {
        try {
            switch (mimeType) {
                case "application/pdf":
                    return await this.parsePDF(fileBuffer);

                case "text/csv":
                case "text/plain":
                    return fileBuffer.toString("utf-8");

                default:
                    throw new Error(`Unsupported file type: ${mimeType}`);
            }
        } catch (error: any) {
            console.error("Document parsing error:", error);
            throw new Error(`Failed to parse document: ${error.message}`);
        }
    }

    /**
     * Fetches a web page URL, strips scripts/styles/nav elements,
     * and extracts the clean page title & readable text.
     */
    static async extractTextFromUrl(url: string): Promise<{ title: string; text: string }> {
        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                },
                timeout: 15000
            });

            const html = response.data;
            const $ = cheerio.load(html);

            // Remove non-content elements
            $("script, style, nav, footer, header, noscript, iframe, svg, button, form").remove();

            // Extract page title (fallback to domain/URL)
            const title =
                $("title").text().trim() ||
                $('meta[property="og:title"]').attr("content") ||
                new URL(url).hostname;

            // Extract main text body
            let text = $("main, article, body").text();

            // Clean & collapse whitespace
            text = text.replace(/\s+/g, " ").trim();

            if (!text || text.length < 20) {
                throw new Error("Could not extract meaningful text from the webpage.");
            }

            return { title, text };
        } catch (error: any) {
            console.error("Web page scraping error:", error.message);
            throw new Error(`Failed to fetch and process URL: ${error.message}`);
        }
    }

    /**
     * Parses PDF buffer using pdf-parse v2 class
     */
    private static async parsePDF(buffer: Buffer): Promise<string> {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        return result.text;
    }
}
