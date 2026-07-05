import { useMemo, useState } from 'react';
import { AlertTriangle, ImageUp, Keyboard, Lightbulb } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import toast from 'react-hot-toast';

import api from '../api/api';
import Loader from '../components/Loader.jsx';
import ResultPanel from '../components/ResultPanel.jsx';
import { rememberLatestAnalysis } from '../utils/pdfReport';
import Layout from './Layout.jsx';

const uploadTips = [
  'Upload original screenshot, not compressed image',
  'Crop unnecessary black borders if possible',
  'Make sure text is visible',
  'Avoid blurred screenshots'
];

const fallbackSuggestions = [
  'Upload a clearer screenshot',
  'Crop the image around the transaction/message text',
  'Avoid compressed or blurred images',
  'Paste the visible text manually'
];

function cleanExtractedText(text = '') {
  return text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isAuthError(error) {
  return error.response?.status === 401 || error.response?.status === 403;
}

export default function AnalyzeImage() {
  const [file, setFile] = useState(null);
  const [manualText, setManualText] = useState('');
  const [result, setResult] = useState(null);
  const [ocrFallback, setOcrFallback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const analyzeExtractedText = async (text, successMessage) => {
    const cleanedText = cleanExtractedText(text);
    if (cleanedText.length < 3) {
      toast.error('Paste visible screenshot text first');
      return null;
    }

    let data;
    try {
      const response = await api.post('/api/analyze/text', {
        input_text: cleanedText,
        source_type: 'screenshot_ocr'
      });
      data = response.data;
    } catch (error) {
      if (!isAuthError(error)) throw error;
      const response = await api.post('/api/public/quick-scan', {
        input_text: cleanedText
      });
      data = response.data;
    }

    const nextResult = {
      ...data,
      success: true,
      ocr_text: cleanedText,
      ocr_method: 'browser_tesseract'
    };
    setResult(nextResult);
    setOcrFallback(null);
    rememberLatestAnalysis(nextResult);
    toast.success(successMessage);
    return nextResult;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) return toast.error('Choose a screenshot first');

    let worker;
    setLoading(true);
    setResult(null);
    setOcrFallback(null);
    setOcrStatus('Preparing image...');
    setOcrProgress(0);

    try {
      worker = await createWorker('eng', undefined, {
        logger: (message) => {
          if (message.status) setOcrStatus(message.status);
          if (typeof message.progress === 'number') {
            setOcrProgress(Math.round(message.progress * 100));
          }
        }
      });

      setOcrStatus('Reading text from image...');
      const { data } = await worker.recognize(file);
      const extractedText = cleanExtractedText(data?.text || '');

      if (extractedText.length <= 10) {
        const fallback = {
          message: 'Could not read enough text from this image.',
          suggestions: fallbackSuggestions
        };
        setOcrFallback(fallback);
        toast.error(fallback.message);
        return;
      }

      setOcrStatus('Analyzing extracted text...');
      setOcrProgress(100);
      await analyzeExtractedText(extractedText, 'Screenshot scanned');
    } catch (error) {
      console.error('Browser OCR image scan failed', error);
      const fallback = {
        message: error.response?.data?.detail || 'Could not read text clearly from this image.',
        suggestions: fallbackSuggestions
      };
      setOcrFallback(fallback);
      toast.error(fallback.message);
    } finally {
      if (worker) await worker.terminate();
      setLoading(false);
      setOcrStatus('');
      setOcrProgress(0);
    }
  };

  const analyzeManualText = async () => {
    setManualLoading(true);
    try {
      await analyzeExtractedText(manualText, 'Pasted text analyzed');
    } catch (error) {
      console.error('Manual screenshot text analysis failed', error);
      toast.error(error.response?.data?.detail || 'Manual text analysis failed');
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <Layout title="Analyze Image" subtitle="Upload a payment screenshot, scam message screenshot, or fake proof image for OCR-based analysis.">
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50">
            <ImageUp className="h-10 w-10 text-blue-600" />
            <span className="mt-3 font-semibold text-slate-950">{file ? file.name : 'Upload payment or scam screenshot'}</span>
            <span className="mt-1 text-sm text-slate-600">PNG, JPG, JPEG, or WEBP</span>
            <input className="sr-only" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>

          {preview && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img src={preview} alt="Selected screenshot preview" className="max-h-96 w-full object-contain" />
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="flex items-center gap-2 font-semibold text-green-800"><Lightbulb className="h-4 w-4" /> Better OCR tips</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-green-700">
              {uploadTips.map((tip) => <li key={tip}>- {tip}</li>)}
            </ul>
          </div>

          <button disabled={loading} className="btn-primary mt-5 w-full">{loading ? 'Scanning screenshot...' : 'Scan Screenshot'}</button>
          {loading && (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <Loader label={ocrStatus || 'Reading text from image...'} />
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${ocrProgress}%` }} />
              </div>
              <p className="mt-2 text-right text-xs font-semibold text-blue-700">{ocrProgress}%</p>
            </div>
          )}
        </form>

        <div className="space-y-5">
          {ocrFallback && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <h3 className="font-bold text-amber-900">Could not read text clearly</h3>
                  <p className="mt-2 text-sm leading-6 text-amber-800">Try uploading a clearer screenshot or paste the visible text manually.</p>
                  <ul className="mt-3 space-y-1 text-sm text-amber-800">
                    {(ocrFallback.suggestions || uploadTips).map((suggestion) => <li key={suggestion}>- {suggestion}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-white p-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Keyboard className="h-4 w-4" /> Paste text from screenshot manually
                </label>
                <textarea
                  className="field mt-2 min-h-36"
                  value={manualText}
                  onChange={(event) => setManualText(event.target.value)}
                  placeholder="Paste text from screenshot manually..."
                />
                <button type="button" disabled={manualLoading} onClick={analyzeManualText} className="btn-primary mt-4">
                  {manualLoading ? 'Analyzing pasted text...' : 'Analyze Pasted Text'}
                </button>
              </div>
            </div>
          )}

          {!loading && !ocrFallback && !result && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <ImageUp className="mx-auto h-9 w-9 text-blue-600" />
              <h3 className="mt-3 font-semibold text-slate-950">Upload a screenshot to begin</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">FinShield will read text in your browser, then analyze the extracted content for fraud signals.</p>
            </div>
          )}

          {result?.ocr_text && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-950">OCR extracted text</h3>
                {result.ocr_method && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Read by browser OCR</span>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{result.ocr_text}</p>
            </div>
          )}

          <ResultPanel result={result} inputType="Image OCR" originalText={result?.ocr_text} />
        </div>
      </div>
    </Layout>
  );
}
