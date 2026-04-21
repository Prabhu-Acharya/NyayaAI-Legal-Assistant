// client/src/pages/DocumentAnalyzer.jsx
import { useState, useCallback, useRef } from "react";
import api from "../services/api";

const POLL_INTERVAL = 3000; // ms

const riskColors = {
  pending:  "bg-gray-100 text-gray-600",
  low:      "bg-green-100 text-green-700",
  medium:   "bg-yellow-100 text-yellow-700",
  high:     "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const statusLabel = {
  uploaded:  "Queued…",
  parsing:   "Parsing document…",
  analysing: "Analysing with AI…",
  done:      "Complete",
  error:     "Error",
};

export default function DocumentAnalyzer() {
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]     = useState(null);   // { status, riskScore, riskLevel, errorMessage }
  const [report, setReport]     = useState(null);
  const [error, setError]       = useState("");
  const pollRef                 = useRef(null);
  const fileInputRef            = useRef(null);

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  // ── Upload ───────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setError("");
    setReport(null);
    setStatus(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const { data } = await api.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!data.success) throw new Error(data.message);
      startPolling(data.documentId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setUploading(false);
    }
  };

  // ── Poll Status ──────────────────────────────────────────────────────────────
  const startPolling = (docId) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/documents/${docId}/status`);
        const doc = data.document;
        setStatus(doc);

        if (doc.status === "done") {
          clearInterval(pollRef.current);
          setUploading(false);
          fetchReport(docId);
        } else if (doc.status === "error") {
          clearInterval(pollRef.current);
          setUploading(false);
          setError(doc.errorMessage || "Analysis failed.");
        }
      } catch {
        clearInterval(pollRef.current);
        setUploading(false);
        setError("Lost connection while polling.");
      }
    }, POLL_INTERVAL);
  };

  // ── Fetch Full Report ────────────────────────────────────────────────────────
  const fetchReport = async (docId) => {
    try {
      const { data } = await api.get(`/api/documents/${docId}/report`);
      if (data.success) setReport(data.document);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report.");
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const reset = () => {
    clearInterval(pollRef.current);
    setFile(null);
    setStatus(null);
    setReport(null);
    setError("");
    setUploading(false);
  };

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Analyzer</h1>
          <p className="text-gray-500 mt-1">Upload a PDF or DOCX — get AI-powered legal risk analysis.</p>
        </div>

        {/* Drop Zone */}
        {!uploading && !report && (
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
              ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <div className="space-y-1">
                <p className="text-lg font-medium text-gray-800">📄 {file.name}</p>
                <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-4xl">📂</p>
                <p className="text-gray-600 font-medium">Drag & drop or click to select</p>
                <p className="text-sm text-gray-400">PDF or DOCX · max 10 MB</p>
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        {file && !uploading && !report && (
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Analyse Document
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Clear
            </button>
          </div>
        )}

        {/* Progress */}
        {uploading && status && (
          <div className="bg-white border rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="animate-spin text-xl">⚙️</span>
              <span className="font-medium text-gray-700">
                {statusLabel[status.status] || status.status}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                style={{
                  width:
                    status.status === "parsing"   ? "33%" :
                    status.status === "analysing" ? "66%" :
                    status.status === "done"      ? "100%" : "10%",
                }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex justify-between">
            <span>{error}</span>
            <button onClick={reset} className="text-sm underline ml-4">Try again</button>
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="space-y-5">
            {/* Risk Banner */}
            <div className={`rounded-xl p-5 flex items-center justify-between ${riskColors[report.riskLevel]}`}>
              <div>
                <p className="text-sm font-medium uppercase tracking-wide opacity-70">Risk Level</p>
                <p className="text-2xl font-bold capitalize">{report.riskLevel}</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black">{report.riskScore}</p>
                <p className="text-xs opacity-60">/ 100</p>
              </div>
            </div>

            {/* Summary */}
            <Section title="Summary">
              <p className="text-gray-700 leading-relaxed">{report.analysis.summary}</p>
            </Section>

            {/* Key Findings */}
            {report.analysis.keyFindings?.length > 0 && (
              <Section title="Key Findings">
                <ul className="space-y-2">
                  {report.analysis.keyFindings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-gray-700">
                      <span className="text-blue-500 mt-0.5">•</span>{f}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Risk Flags */}
            {report.analysis.riskFlags?.length > 0 && (
              <Section title="⚠️ Risk Flags">
                <ul className="space-y-2">
                  {report.analysis.riskFlags.map((r, i) => (
                    <li key={i} className="flex gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2">
                      <span>⚑</span>{r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Recommendations */}
            {report.analysis.recommendations?.length > 0 && (
              <Section title="Recommendations">
                <ol className="space-y-2 list-decimal list-inside">
                  {report.analysis.recommendations.map((r, i) => (
                    <li key={i} className="text-gray-700">{r}</li>
                  ))}
                </ol>
              </Section>
            )}

            <button
              onClick={reset}
              className="w-full border border-gray-300 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              Analyse Another Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
      {children}
    </div>
  );
}