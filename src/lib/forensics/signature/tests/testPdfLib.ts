import { PDFDocument } from "pdf-lib";

export async function testPdf(bytes: Uint8Array) {
    const pdf = await PDFDocument.load(bytes);

    console.log("Pages:", pdf.getPageCount());

    console.log(pdf);
}
