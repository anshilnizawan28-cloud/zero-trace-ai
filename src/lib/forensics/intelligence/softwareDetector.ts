export interface SoftwareInfo {
  name: string;
  vendor: string;
  confidence: number;
  category:
    | "PDF Editor"
    | "Office"
    | "Browser"
    | "Scanner"
    | "Unknown";
}

export function detectSoftware(
  creator?: string,
  producer?: string,
): SoftwareInfo {

  const value = `${creator ?? ""} ${producer ?? ""}`.toLowerCase();

  if (value.includes("acrobat")) {
    return {
      name: "Adobe Acrobat",
      vendor: "Adobe",
      confidence: 100,
      category: "PDF Editor",
    };
  }

  if (value.includes("foxit")) {
    return {
      name: "Foxit PDF",
      vendor: "Foxit",
      confidence: 100,
      category: "PDF Editor",
    };
  }

  if (value.includes("libreoffice")) {
    return {
      name: "LibreOffice",
      vendor: "The Document Foundation",
      confidence: 100,
      category: "Office",
    };
  }

  if (value.includes("microsoft")) {
    return {
      name: "Microsoft Office",
      vendor: "Microsoft",
      confidence: 95,
      category: "Office",
    };
  }

  if (value.includes("ghostscript")) {
    return {
      name: "Ghostscript",
      vendor: "Artifex",
      confidence: 95,
      category: "PDF Editor",
    };
  }

  if (value.includes("chrome")) {
    return {
      name: "Google Chrome",
      vendor: "Google",
      confidence: 90,
      category: "Browser",
    };
  }

  return {
    name: "Unknown",
    vendor: "Unknown",
    confidence: 0,
    category: "Unknown",
  };
}
