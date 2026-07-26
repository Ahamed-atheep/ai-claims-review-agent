import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useClaimStore } from '@/store/useClaimStore'
import { cn } from '@/lib/utils'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface CitationPdfViewerProps {
  pdfUrl: string | null
}

export const CitationPdfViewer: React.FC<CitationPdfViewerProps> = ({ pdfUrl }) => {
  const { selectedCitation } = useClaimStore()
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [loadError, setLoadError] = useState(false)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoadError(false)
  }

  const onDocumentLoadError = () => {
    setLoadError(true)
  }

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 2.5))
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5))

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
        <FileText size={15} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-600 flex-1">Document Evidence Inspector</span>

        {/* Active citation badge */}
        <AnimatePresence>
          {selectedCitation && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 8 }}
              className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200"
            >
              📌 {selectedCitation}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
            title="Zoom out"
            id="pdf-zoom-out-btn"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-mono text-gray-500 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
            title="Zoom in"
            id="pdf-zoom-in-btn"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-50 relative" id="pdf-viewer-content">
        {!pdfUrl ? (
          <NoPdfPlaceholder />
        ) : loadError ? (
          <PdfErrorState />
        ) : (
          <div className="flex flex-col items-center py-4 px-2 min-h-full">
            {selectedCitation && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700"
              >
                <AlertCircle size={13} className="flex-shrink-0" />
                <span>
                  Viewing evidence for citation{' '}
                  <strong className="font-mono">{selectedCitation}</strong> — scroll to highlighted section
                </span>
              </motion.div>
            )}

            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center gap-3 py-16">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-400">Loading document...</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-md rounded-lg overflow-hidden"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        )}
      </div>

      {/* Page navigation */}
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-2.5 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
            id="pdf-prev-page-btn"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-mono text-gray-600">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(p + 1, numPages!))}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
            id="pdf-next-page-btn"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

const NoPdfPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
    <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center">
      <FileText size={28} className="text-gray-300" />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-500">No document loaded</p>
      <p className="text-xs text-gray-400 mt-1">Upload a claim document to view it here</p>
    </div>
  </div>
)

const PdfErrorState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
    <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center">
      <AlertCircle size={28} className="text-red-400" />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-600">Could not load document</p>
      <p className="text-xs text-gray-400 mt-1">The PDF may be corrupted or inaccessible</p>
    </div>
  </div>
)
