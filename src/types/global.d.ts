// Tipos globales para las librerías externas

declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: 'p' | 'portrait' | 'l' | 'landscape', unit?: string, format?: string | number[])
    addPage(): jsPDF
    addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): jsPDF
    save(filename: string): void
    text(text: string, x: number, y: number): jsPDF
  }
}

declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number
    useCORS?: boolean
    allowTaint?: boolean
    backgroundColor?: string
    logging?: boolean
    width?: number
    height?: number
  }
  
  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>
  export default html2canvas
}

declare module 'xlsx' {
  interface WorkBook {
    SheetNames: string[]
    Sheets: { [key: string]: WorkSheet }
  }
  
  interface WorkSheet {
    [key: string]: any
  }
  
  const utils: {
    book_new(): WorkBook
    aoa_to_sheet(data: any[][]): WorkSheet
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void
  }
  
  function writeFile(wb: WorkBook, filename: string): void
  
  export { utils, writeFile, WorkBook, WorkSheet }
}

declare module 'file-saver' {
  function saveAs(data: Blob | string, filename?: string): void
  export { saveAs }
} 