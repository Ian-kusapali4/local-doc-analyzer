import { useMemo } from 'react';
import type { UiLanguage } from '../types';
import { useAppStore } from './store';

// ─── Translation dictionary ───

/**
 * Translation entry map. v0.18.5 T2: exported as `_translations` for runtime parity and quality validation.
 * Production code should use only `t()` / `useT()` and avoid direct references to this object
 * (typos can otherwise slip past type checking). This is a test/debug-only access channel.
 */
export const _translations = {
  // ─── Common ───
  'common.close': { ko: 'Close', en: 'Close' },
  // ─── Multi-document tabs (multi-doc Phase 1) ───
  'tabs.label': { ko: 'Open documents', en: 'Open documents' },
  'tabs.close': { ko: 'Close tab {name}', en: 'Close tab {name}' },
  'tabs.newTab': { ko: 'Open a new document', en: 'Open a new document' },
  // QA23(D-MED): if session saving is disabled, switching tabs destroys the current document's summary and Q&A (no place to save them).
  // QA28(B-Low): confirms unsaved edits in the settings panel (custom templates, etc.) are discarded.
  'settings.discardConfirm': {
    ko: 'You have unsaved settings changes. Discard them and close?',
    en: 'You have unsaved settings changes. Discard them and close?',
  },
  // QA28(B2-Low): 모델 다운로드 취소 요청 자체가 실패했을 때.
  'settings.cancelPullFail': { ko: 'Failed to cancel the download. Please try again shortly.', en: 'Failed to cancel the download. Please try again shortly.' },
  'tabs.discardOnSwitchConfirm': {
    ko: 'Session saving is off, so switching tabs will discard this document’s summary and Q&A. Continue?\n(You can turn saving on in Settings → Session data.)',
    en: 'Session saving is off, so switching tabs will discard this document’s summary and Q&A. Continue?\n(You can turn saving on in Settings → Session data.)',
  },
  'tabs.switchFail': { ko: 'Could not switch tabs because the original file was not found. If it was moved or deleted, please open it again.', en: 'Could not switch tabs because the original file was not found. If it was moved or deleted, please open it again.' },
  'common.renderError': { ko: 'A rendering error occurred.', en: 'A rendering error occurred.' },
  'common.imagePlaceholder': { ko: '[image]', en: '[image]' },
  'common.blockedLink': { ko: 'Blocked link (unsupported URL scheme)', en: 'Blocked link (unsupported URL scheme)' },

  // ─── Page citation / PDF viewer (page-citation-viewer) ───
  // P4: 스크린리더·툴팁용 단위 표현("2 페이지" / "슬라이드 2" / "2장"). 버튼에 보이는 짧은 라벨
  // (citation.unit.*, "p.2")과 달리 문장 안에서 읽힌다.
  'unit.spoken.page': { ko: 'page {n}', en: 'page {n}' },
  'unit.spoken.slide': { ko: 'slide {n}', en: 'slide {n}' },
  'unit.spoken.chapter': { ko: 'chapter {n}', en: 'chapter {n}' },
  'citation.aria': { ko: 'Open source {unit}', en: 'Open source {unit}' },
  'citation.tooltip': { ko: 'Click to view source on {unit}', en: 'Click to view source on {unit}' },
  // QA35: {unit} = unit.spoken.* — 슬라이드 덱에서 "유효하지 않은 페이지" 로 말하지 않는다.
  'citation.invalid': { ko: 'Invalid location ({unit})', en: 'Invalid location ({unit})' },
  // 컬렉션 Q&A 교차 문서 인용 (multi-doc Phase 2)
  'citation.crossTooltip': { ko: 'Click to open {name} on {unit}', en: 'Click to open {name} on {unit}' },
  'citation.crossAria': { ko: 'Open {name} {unit}', en: 'Open {name} {unit}' },
  'citation.docClosed': { ko: 'Cannot navigate — {name} is not open', en: 'Cannot navigate — {name} is not open' },
  // QA21(D-MED): 같은 이름의 문서가 둘 이상 열려 있으면 어느 쪽인지 판정할 수 없다 — 이전에는
  // 앞의 것으로 조용히 점프했다(활성 문서와 이름이 겹치면 활성 문서로). 표면화가 정답.
  'citation.ambiguousDoc': { ko: 'Several open documents are named {name}, so the source cannot be determined — close one to navigate', en: 'Several open documents are named {name}, so the source cannot be determined — close one to navigate' },
  // Task12: 표시용 인용 라벨(formatUnitLabel) 이 unitKind 별로 참조하는 키. AI 프롬프트에
  // 주입되는 formatPromptPageLabel 의 `[p.N]` 과는 무관 — 이쪽은 화면에만 보인다.
  'citation.unit.page': { ko: 'p.{n}', en: 'p.{n}' },
  'citation.unit.slide': { ko: 'Slide {n}', en: 'Slide {n}' },
  'citation.unit.chapter': { ko: 'Ch. {n}', en: 'Ch. {n}' },
  // P4: 단위 **개수** 표기의 단일 출처(formatUnitCount). long = 최근 문서 목록, short = 헤더·탭 괄호.
  // page 의 short 는 종전 "(2p)" 표기를 그대로 둔다(E2E·사용자 익숙함).
  'unit.count.page': { ko: '{n} pages', en: '{n} pages' },
  'unit.count.slide': { ko: '{n} slides', en: '{n} slides' },
  'unit.count.chapter': { ko: '{n} chapters', en: '{n} chapters' },
  'unit.countShort.page': { ko: '{n}p', en: '{n}p' },
  'unit.countShort.slide': { ko: '{n} slides', en: '{n} slides' },
  'unit.countShort.chapter': { ko: '{n} ch.', en: '{n} ch.' },
  // QA35: 단위 **이름**(formatUnitName) — "시작 {unit}" 처럼 수식어와 함께 문장에 끼운다.
  'unit.name.page': { ko: 'page', en: 'page' },
  'unit.name.slide': { ko: 'slide', en: 'slide' },
  'unit.name.chapter': { ko: 'chapter', en: 'chapter' },
  // QA35: 단위 구간(formatUnitRange) — 범위 요약 표식이 요약 본문에 저장한다. 'p.' 금지(인용 오인).
  'unit.range.page': { ko: 'pages {start}-{end}', en: 'pages {start}-{end}' },
  'unit.range.slide': { ko: 'slides {start}-{end}', en: 'slides {start}-{end}' },
  'unit.range.chapter': { ko: 'chapters {start}-{end}', en: 'chapters {start}-{end}' },
  'pdfviewer.title': { ko: 'Source Viewer', en: 'Source Viewer' },
  'pdfviewer.close': { ko: 'Close viewer', en: 'Close viewer' },
  'pdfviewer.loading': { ko: 'Loading PDF...', en: 'Loading PDF...' },
  'pdfviewer.renderFail': { ko: 'Failed to load PDF viewer', en: 'Failed to load PDF viewer' },
  'pdfviewer.pageOf': { ko: 'Page {current} of {total}', en: 'Page {current} of {total}' },
  'pdfviewer.pageRenderFail': { ko: 'Failed to render page', en: 'Failed to render page' },
  'pdfviewer.resize': { ko: 'Resize panel (arrow keys or drag)', en: 'Resize panel (arrow keys or drag)' },
  'pdfviewer.zoomIn': { ko: 'Zoom in', en: 'Zoom in' },
  'pdfviewer.zoomOut': { ko: 'Zoom out', en: 'Zoom out' },
  'pdfviewer.zoomReset': { ko: 'Reset to fit (100%)', en: 'Reset to fit (100%)' },
  'pdfviewer.zoomLevel': { ko: 'Zoom {percent}', en: 'Zoom {percent}' },
  'pdfviewer.pagesRegion': { ko: 'Document pages', en: 'Document pages' },
  'pdfviewer.jumpTimeout': { ko: 'Page rendering is taking longer than expected. Please try again in a moment.', en: 'Page rendering is taking longer than expected. Please try again in a moment.' },
  'outline.title': { ko: 'Contents', en: 'Contents' },
  'outline.toggle': { ko: 'Toggle contents', en: 'Toggle contents' },
  'outline.jumpToPage': { ko: 'Jump to page {page}', en: 'Jump to page {page}' },
  'ai.generateFail': { ko: 'Failed to generate summary.', en: 'Failed to generate summary.' },
  // QA30(A-F8): 스트림이 공백만 흘리고 정상 종료하면 finalContent 가 비어 setSummary 를
  // 건너뛰었고, 그러면 요약도 에러도 없이 스피너만 사라졌다(무음 실패). 명시 에러로 표면화.
  'ai.emptySummary': { ko: 'The AI returned an empty summary. Try a different model or try again in a moment.', en: 'The AI returned an empty summary. Try a different model or try again in a moment.' },
  'ai.requestFail': { ko: 'Failed to send summary request.', en: 'Failed to send summary request.' },
  'ai.streamInterrupted': { ko: 'AI response stream interrupted. Please check your network connection and AI service status.', en: 'AI response stream interrupted. Please check your network connection and AI service status.' },
  // QA: use-summarize 가 직접 setError/throw 하던 하드코딩 한국어 → i18n(영어 UI 미번역 해소)
  'ai.imageAnalysisFail': { ko: 'Image analysis failed. Please check your Vision model.', en: 'Image analysis failed. Please check your Vision model.' },
  // QA6-D: 이미지 분석 OFF 로 파싱된 문서를 ON 전환 후 재요약 — 무음 no-op 대신 재오픈 안내
  'summary.imagesSkippedNotice': { ko: 'This document was opened with image analysis turned off, so no images were extracted. Reopen the document to apply image analysis.', en: 'This document was opened with image analysis turned off, so no images were extracted. Reopen the document to apply image analysis.' },
  // QA27(A-Important): 저장된 세션에서 복원된 문서는 이미지를 싣지 않는다(전환 즉시성 우선).
  // 원래 이미지가 있던 문서면 재요약이 Vision 없이 진행되므로 사유를 밝힌다 — 위 문구와 달리
  // 설정은 이미 켜져 있고, 필요한 조작은 "파일을 다시 열기" 다.
  'summary.imagesUnloadedNotice': { ko: 'This document was restored from a saved session, so its images are not in memory. Reopen the original file to include image analysis in the summary.', en: 'This document was restored from a saved session, so its images are not in memory. Reopen the original file to include image analysis in the summary.' },
  'summary.templateNotFound': { ko: 'The selected custom summary template was not found. It may have been deleted in settings.', en: 'The selected custom summary template was not found. It may have been deleted in settings.' },
  'summary.customTruncated': { ko: 'The document is long, so the custom summary was generated from the beginning only. Later content may not be included.', en: 'The document is long, so the custom summary was generated from the beginning only. Later content may not be included.' },
  // QA29(C-3, 데이터손실): 스트림이 환경 요인(모델 언로드·네트워크 단절)으로 끊기면 이미 받아 둔
  // 토큰이 화면에만 남고 디스크에는 한 글자도 닿지 않는다 — 자동 커밋은 "생성 중 skip 과 구분"
  // (QA12) 을 깨므로, 사용자가 승인할 때만 저장한다. 아래 4개가 그 경로의 문구.
  'summary.partialRecoveryHint': { ko: 'You can still save the portion generated so far.', en: 'You can still save the portion generated so far.' },
  'summary.partialRecoverAction': { ko: 'Save what was generated', en: 'Save what was generated' },
  'summary.partialMarker': { ko: '[... truncated — the summary was interrupted, so only this much was saved]', en: '[... truncated — the summary was interrupted, so only this much was saved]' },
  'summary.outputLimitMarker': { ko: '[... truncated — the summary hit the AI output limit and was cut off here]', en: '[... truncated — the summary hit the AI output limit and was cut off here]' },
  // QA32(B·C): **입력** 절단 표식. 위 둘은 출력이 잘린 경우인데, 문서 앞부분만 보고 만든
  // 산출물에는 표식이 없어 저장본이 "이 문서의 요약" 으로 보였다. 같은 자리·형식(본문 말미
  // 대괄호 한 줄)을 쓰는 이유도 같다 — 세션에서 다시 연 요약에는 UI 상태가 남지 않는다.
  'summary.inputTruncatedMarker': { ko: '[Note — this summary was written from the beginning of the document only; later content is not included]', en: '[Note — this summary was written from the beginning of the document only; later content is not included]' },
  // QA35: {range} = formatUnitRange(문서 단위). 요약 본문에 저장되고 교차 요약 입력이 되므로
  // 'p.' 를 쓰지 않는다(CITATION_REGEX 오인) — use-summarize-hook 테스트가 파싱 무해를 고정한다.
  'summary.pageRangeMarker': { ko: '[Note — this summary covers only {range}]', en: '[Note — this summary covers only {range}]' },
  'summary.partialSaved': { ko: 'Saved the interrupted summary up to the portion that was generated.', en: 'Saved the interrupted summary up to the portion that was generated.' },
  // Vision 실패 시 전체 요약을 막지 않고 텍스트 전용으로 강등할 때의 비차단 안내.
  'ai.imageAnalysisSkipped': { ko: 'Skipped image analysis and summarized text only (no/failed Vision model — install e.g. llava to include images).', en: 'Skipped image analysis and summarized text only (no/failed Vision model — install e.g. llava to include images).' },
  'ai.summaryTimeout': { ko: 'Summary timed out. The portion generated so far is shown. Try reducing chunk size or using a lighter model.', en: 'Summary timed out. The portion generated so far is shown. Try reducing chunk size or using a lighter model.' },
  'ai.ollamaNotRunning': { ko: 'Ollama is not running. Please check your settings.', en: 'Ollama is not running. Please check your settings.' },
  'ai.apiKeyMissing': { ko: '{provider} API key is not set. Please enter it in Settings.', en: '{provider} API key is not set. Please enter it in Settings.' },
  'ai.noText': { ko: 'Nothing to summarize. No meaningful text could be extracted from the document.', en: 'Nothing to summarize. No meaningful text could be extracted from the document.' },
  'common.save': { ko: 'Save', en: 'Save' },
  'common.delete': { ko: 'Delete', en: 'Delete' },
  'common.cancel': { ko: 'Cancel', en: 'Cancel' },
  'common.retry': { ko: 'Retry', en: 'Retry' },
  'common.send': { ko: 'Send', en: 'Send' },
  'common.none': { ko: 'None', en: 'None' },
  'common.saved': { ko: 'Saved', en: 'Saved' },

  // ─── App ───
  'app.title': { ko: 'MHC Document Analyzer', en: 'MHC Document Analyzer' },
  'app.logo': { ko: 'Logo', en: 'Logo' },
  'app.settings': { ko: 'Settings', en: 'Settings' },
  'app.closeError': { ko: 'Close error', en: 'Close error' },
  'app.removeFile': { ko: 'Close current document', en: 'Close current document' },
  'app.otherFile': { ko: '✕ Close document', en: '✕ Close document' },
  'app.startSummary': { ko: '📝 Summarize', en: '📝 Summarize' },
  'app.openPdf': { ko: 'Open Document', en: 'Open Document' },
  'app.openPdfHint': { ko: 'Open Document (Ctrl+O)', en: 'Open Document (Ctrl+O)' },
  'app.viewSummary': { ko: '📄 View summary / Continue Q&A', en: '📄 View summary / Continue Q&A' },
  'app.reSummarize': { ko: '🔄 Re-summarize', en: '🔄 Re-summarize' },
  'app.ollamaNotReady': { ko: 'Ollama is not running or has no installed models.', en: 'Ollama is not running or has no installed models.' },
  'app.openSettings': { ko: 'Open settings', en: 'Open settings' },
  'app.downloadingModel': { ko: 'Downloading model: {model}', en: 'Downloading model: {model}' },
  'app.modelDownloadFail': { ko: 'Model download failed: {model} — {error}', en: 'Model download failed: {model} — {error}' },
  'app.modelDownloadFailPartial': {
    ko: 'Model download failed: {model} — {error} (installed: {succeeded})',
    en: 'Model download failed: {model} — {error} (installed: {succeeded})',
  },
  'app.modelDownloadFailDefault': { ko: 'Please check your network', en: 'Please check your network' },
  'app.modelInstallDone': { ko: 'Model installation complete', en: 'Model installation complete' },
  'app.modelHint': {
    ko: 'Current model ({model}) may have limited Korean performance. Switch to {recommended} in settings for better quality.',
    en: 'Current model ({model}) may have limited Korean performance. Switch to {recommended} in settings for better quality.',
  },

  // ─── PdfUploader ───
  'uploader.fileTooLarge': { ko: 'File too large ({size}MB). Maximum 100MB supported.', en: 'File too large ({size}MB). Maximum 100MB supported.' },
  'uploader.cannotRead': { ko: 'Cannot read document.', en: 'Cannot read document.' },
  'uploader.multipleFiles': { ko: 'Only one file can be processed at a time. Opening the first file ({name}) only.', en: 'Only one file can be processed at a time. Opening the first file ({name}) only.' },
  'uploader.notPdf': { ko: 'Only these file types are supported: {list}.', en: 'Only these file types are supported: {list}.' },
  // ─── openDocumentData 진입 가드(모든 파일 열기 경로 공통) ───
  'pdf.busyGenerating': { ko: 'Cannot open a new file while summarizing.', en: 'Cannot open a new file while summarizing.' },
  'pdf.busyQa': { ko: 'Cannot open a new file while answering Q&A.', en: 'Cannot open a new file while answering Q&A.' },
  'pdf.busyCollection': { ko: 'Cannot open a new file while summarizing a collection.', en: 'Cannot open a new file while summarizing a collection.' },
  'pdf.busyCollectionOpen': { ko: 'Cannot open a new file while opening a collection.', en: 'Cannot open a new file while opening a collection.' },
  'pdf.encrypted': { ko: 'This PDF is password-protected. Please remove the password and try again.', en: 'This PDF is password-protected. Please remove the password and try again.' },
  // Task10: document-open.ts 의 포맷 dispatch 가 쓰는 코드. `doc.unsupported` 는 이 지점에
  // 도달했을 때 실제로 "우리가 모르는 컨테이너"인 경우(zip 이지만 sniff 가 매칭하는 추출기가
  // 없음)에만 쓴다 — 확장자는 진입 게이트 5곳이 이미 걸렀으므로 도달 시점엔 항상 지원 목록
  // 안이다. list 는 SUPPORTED_FORMATS 라벨 조합("PDF · Word")을 주입한다.
  'doc.unsupported': {
    ko: 'Unsupported file format. Supported formats: {list}',
    en: 'Unsupported file format. Supported formats: {list}',
  },
  // 확장자는 지원 포맷인데(진입 게이트가 이미 확인) 내용이 zip/pdf 매직과 맞지 않거나(위장·손상)
  // zip 자체가 깨진 경우. "지원 형식: PDF" 라고 답하면 `.pdf` 로 드롭한 사용자가 "내 건 .pdf 인데?"
  // 가 된다 — 손상/형식 불일치로 정확히 안내한다.
  // Task10 fix round1(Minor 6): 형제 3종(unsupported/encrypted/tooLarge)은 전부 다음 행동을
  // 알려주는데 이것만 상태만 말하고 끝났다 — 다른 파일로 재시도하라고 맺는다.
  'doc.corrupt': {
    ko: 'The file may be corrupted or in a different format. Please try a different file.',
    en: 'The file may be corrupted or in a different format. Please try a different file.',
  },
  'doc.encrypted': { ko: 'This document is password-protected. Please remove the password and try again.', en: 'This document is password-protected. Please remove the password and try again.' },
  'doc.distribution': {
    ko: 'Distribution-only HWP documents are encrypted and cannot be opened. Save it as a regular document in Hancom Office and try again.',
    en: 'Distribution-only HWP documents are encrypted and cannot be opened. Save it as a regular document in Hancom Office and try again.',
  },
  'doc.tooLarge': { ko: 'This file expands to an excessive size when decompressed. Please try a smaller file.', en: 'This file expands to an excessive size when decompressed. Please try a smaller file.' },
  // Task10 fix round1(Important 3): docx.ts 의 DOC_NO_TEXT(문서에 추출할 텍스트가 없음)를
  // 사용자에게 안내하는 문구. 추출기 내부 throw 는 개발자용 영어('no text in document')라
  // document-open.ts 의 catch 가 이 키로 덮어쓴다(uploader.noText 는 OCR 안내가 섞여 있어
  // OCR 이 없는 비-PDF 포맷에는 맞지 않는다).
  'doc.noText': {
    ko: 'No text could be extracted from the document. Please check the file contents.',
    en: 'No text could be extracted from the document. Please check the file contents.',
  },
  // QA22(B-LOW): 챕터 감지 실패 시 페이지 분할 제목. 한국어 하드코딩이라 영어 UI 에서도
  // 요약 헤딩(`## 1~10 페이지`)과 진행률에 그대로 노출됐다.
  'pdf.pageRangeChapter': { ko: 'Pages {start}–{end}', en: 'Pages {start}–{end}' },
  // QA35: detectChapters 폴백 분할 제목의 단위별 형제(RANGE_CHAPTER_KEY, pdf-parser.ts).
  'doc.slideRangeChapter': { ko: 'Slides {start}–{end}', en: 'Slides {start}–{end}' },
  'doc.chapterRangeChapter': { ko: 'Chapters {start}–{end}', en: 'Chapters {start}–{end}' },
  // QA22(B-MED): 텍스트를 추출하지 못한 페이지 고지. OCR 진입 판정이 **문서 전체 합계**라,
  // 표지 한 장만 텍스트 레이어를 가진 스캔본은 임계를 통과해 OCR 이 아예 돌지 않고 나머지
  // 페이지가 빈 채로 요약·인용·RAG 에 들어간다 — 에러도 배지도 없이. 자동 OCR 승격은
  // 오검출 시 실제 과금(클라우드 OCR)이라 보류하고, 우선 **무음을 없앤다**.
  'pdf.emptyPagesNotice': {
    ko: 'No text could be extracted from {count} of {total} pages. If this is a scanned PDF, enable OCR in Settings and reopen it — summaries, citations, and search cannot see those pages.',
    en: 'No text could be extracted from {count} of {total} pages. If this is a scanned PDF, enable OCR in Settings and reopen it — summaries, citations, and search cannot see those pages.',
  },
  // QA22(B-MED): OCR 부분 실패 고지. per-page 실패가 전부 빈 문자열로 수렴하는데 상위 게이트는
  // 전체 합계뿐이라, 200페이지 중 150이 429/타임아웃으로 실패해도 정상 완료 UI 로 끝났다.
  'pdf.ocrPartialFailNotice': {
    ko: 'OCR failed on {count} of {total} pages. Those pages are excluded from summaries, citations, and search — reopen the document later to retry.',
    en: 'OCR failed on {count} of {total} pages. Those pages are excluded from summaries, citations, and search — reopen the document later to retry.',
  },
  // QA22(B-MED): Vision 이미지 예산 소진 고지. 슬라이드마다 반복되는 로고가 앞 페이지에서
  // 50장 예산을 선점하면 뒷부분의 실제 차트·수식이 한 장도 분석되지 않는다.
  'pdf.imageBudgetNotice': {
    ko: 'This document has many images; only the first {max} were captured for analysis. Figures later in the document may not be included.',
    en: 'This document has many images; only the first {max} were captured for analysis. Figures later in the document may not be included.',
  },
  // QA35: 문서 단위를 따른다 — 파라미터는 tooManyUnitsParams(pdf-parser.ts) 가 만든다
  // ({unit}=unit.name, {pages}=개수 short, {max}=개수 long). PDF 문구는 종전과 글자 단위로 같다.
  'uploader.tooManyPages': { ko: 'Too many {unit}s ({pages}). Maximum {max} supported. Please split the document.', en: 'Too many {unit}s ({pages}). Maximum {max} supported. Please split the document.' },
  // QA7(D-MED): 파싱 에러 3종 i18n 이행 — tooManyPages 와 동일 패턴(영어 UI 한국어 노출 해소)
  'uploader.emptyPdf': { ko: 'The PDF has no pages.', en: 'The PDF has no pages.' },
  'uploader.noText': { ko: 'No text could be extracted from the PDF. Enable "Scanned PDF OCR" in Settings to analyze image-based PDFs.', en: 'No text could be extracted from the PDF. Enable "Scanned PDF OCR" in Settings to analyze image-based PDFs.' },
  'uploader.ocrFail': { ko: 'Text could not be extracted even with OCR. Please check the PDF quality.', en: 'Text could not be extracted even with OCR. Please check the PDF quality.' },
  // QA30(A-F4): 401 은 "OCR 실패" 가 아니라 키 문제다 — per-page catch 가 삼키던 것을 표면화.
  'uploader.ocrAuthFail': { ko: 'OCR could not run because the API key is not valid. Please check your API key in Settings.', en: 'OCR could not run because the API key is not valid. Please check your API key in Settings.' },
  'uploader.cancelParse': { ko: 'Cancel document processing', en: 'Cancel document processing' },
  'uploader.cancelBtn': { ko: '■ Cancel', en: '■ Cancel' },
  'uploader.ocrProgress': { ko: 'Recognizing scanned PDF text...', en: 'Recognizing scanned PDF text...' },
  'uploader.ocrLabel': { ko: 'OCR progress', en: 'OCR progress' },
  'uploader.ocrDesc': { ko: 'Extracting text with Vision model', en: 'Extracting text with Vision model' },
  'uploader.reading': { ko: 'Reading document...', en: 'Reading document...' },
  'uploader.wait': { ko: 'Please wait', en: 'Please wait' },
  // QA35: 비-PDF 추출 진행(document-open 의 onProgress). OCR 문구와 섞지 않는 포맷 중립 라벨.
  'uploader.extractProgress': { ko: 'Extracting content', en: 'Extracting content' },
  'uploader.dragDrop': { ko: 'Drag document here or', en: 'Drag document here or' },
  'uploader.clickSelect': { ko: 'click to select', en: 'click to select' },
  'uploader.selectFile': { ko: 'Select file', en: 'Select file' },
  'uploader.orShortcut': { ko: 'or press Ctrl+O', en: 'or press Ctrl+O' },

  // ─── SummaryTypeSelector ───
  'selector.full': { ko: 'Full summary', en: 'Full summary' },
  'selector.chapter': { ko: 'By chapter', en: 'By chapter' },
  'selector.keywords': { ko: 'Keywords', en: 'Keywords' },
  'selector.summaryType': { ko: 'Summary type', en: 'Summary type' },
  'selector.summaryLang': { ko: 'Output language', en: 'Output language' },
  // 출력언어 드롭다운의 'auto' 옵션. 나머지(한국어/English/日本語/中文)는 언어명 자체라 비번역.
  'selector.langAuto': { ko: 'Keep original', en: 'Keep original' },
  // QA35: 범위 UI 는 문서 단위를 따른다. 레이블은 영어 대문자 규칙 때문에 단위별 키, 나머지는
  // {unit}(unit.name.*) / {count}(formatUnitCount long) 보간.
  'selector.pageRange': { ko: 'Page range', en: 'Page range' },
  'selector.slideRange': { ko: 'Slide range', en: 'Slide range' },
  'selector.chapterRange': { ko: 'Chapter range', en: 'Chapter range' },
  'selector.pageRangeAll': { ko: 'All', en: 'All' },
  'selector.pageRangeCustom': { ko: 'Custom', en: 'Custom' },
  'selector.pageRangeTotal': { ko: '/ {count}', en: '/ {count}' },
  'selector.pageRangeAria': { ko: 'Start {unit}', en: 'Start {unit}' },
  'selector.pageRangeAriaEnd': { ko: 'End {unit}', en: 'End {unit}' },
  'selector.modelWarning': {
    ko: '{model} is a Korean-specialized model with limited multilingual output. Switch to gemma3 or qwen3.5 in settings for better results.',
    en: '{model} is a Korean-specialized model with limited multilingual output. Switch to gemma3 or qwen3.5 in settings for better results.',
  },

  // ─── SummaryViewer ───
  'viewer.defaultFilename': { ko: 'summary.md', en: 'summary.md' },
  'viewer.saveFail': { ko: 'Failed to save file. Please choose a different path.', en: 'Failed to save file. Please choose a different path.' },
  'viewer.copyFail': { ko: 'Cannot copy to clipboard.', en: 'Cannot copy to clipboard.' },
  'viewer.result': { ko: '📎 Summary result', en: '📎 Summary result' },
  // a11y 재감사(2026-09-03): 위 값은 **시각 표시용**이라 이모지를 품는다. 접근성 이름으로
  // 쓰면 리더가 "클립 이모지 요약 결과" 로 읽는다 — 이름에는 장식이 들어가면 안 된다.
  'viewer.resultAria': { ko: 'Summary result', en: 'Summary result' },
  'viewer.analyzing': { ko: 'AI is analyzing the document...', en: 'AI is analyzing the document...' },
  'viewer.pleaseWait': { ko: 'Please wait', en: 'Please wait' },
  'viewer.stopSummary': { ko: 'Stop summary', en: 'Stop summary' },
  'viewer.stopBtn': { ko: '■ Stop', en: '■ Stop' },
  'viewer.export': { ko: '💾 Export .md', en: '💾 Export .md' },
  'viewer.exportAria': { ko: 'Export as markdown file', en: 'Export as markdown file' },
  'viewer.copy': { ko: '📋 Copy', en: '📋 Copy' },
  'viewer.copied': { ko: '✓ Copied', en: '✓ Copied' },
  // 위 문구의 스크린리더판 — 장식 기호(✓)는 눈에만 필요하고, 리더가 읽으면 "체크 표시" 가
  // 통지 앞에 붙어 번잡해진다. Toast 의 srMessage 로 전달된다.
  'viewer.copiedSr': { ko: 'Copied', en: 'Copied' },
  // QA32 후속: 세로 분할(요약 본문 ↔ Q&A) 핸들. 좌우 분할과 같은 관용구.
  'viewer.resizeSplit': { ko: 'Resize summary and chat areas', en: 'Resize summary and chat areas' },
  'viewer.copyAria': { ko: 'Copy to clipboard', en: 'Copy to clipboard' },
  'viewer.exportPdf': { ko: '📄 PDF', en: '📄 PDF' },
  'viewer.exportPdfAria': { ko: 'Export as PDF file', en: 'Export as PDF file' },
  // 요약 마인드맵 — 텍스트/마인드맵 뷰 토글 + 마인드맵 UI
  'viewer.viewText': { ko: '📝 Text', en: '📝 Text' },
  'viewer.viewMindMap': { ko: '🗺 Mind map', en: '🗺 Mind map' },
  'viewer.viewToggleAria': { ko: 'Switch summary view', en: 'Switch summary view' },
  'mindmap.title': { ko: 'Summary mind map', en: 'Summary mind map' },
  'mindmap.empty': { ko: 'No headings found to build a mind map. Use the text view.', en: 'No headings found to build a mind map. Use the text view.' },
  'mindmap.expand': { ko: 'Expand', en: 'Expand' },
  'mindmap.collapse': { ko: 'Collapse', en: 'Collapse' },
  'mindmap.untitled': { ko: '(untitled)', en: '(untitled)' },
  'viewer.pdfFail': { ko: 'Failed to export PDF. Please choose a different path.', en: 'Failed to export PDF. Please choose a different path.' },

  // ─── QaChat ───
  'qa.header': { ko: 'Ask about the document', en: 'Ask about the document' },
  'qa.indexing': { ko: 'RAG indexing', en: 'RAG indexing' },
  // QA19(C-MED): RAG 빌드 실패(대개 네트워크 단절) 시 헤더 배지 — 키워드 강등을 사용자에게 알린다.
  'qa.indexFailed': { ko: 'Indexing failed', en: 'Indexing failed' },
  'qa.indexFailedTooltip': {
    ko: 'Embedding failed, so keyword search is used. Check your network and reopen the document to re-index. (Your previous index is preserved.)',
    en: 'Embedding failed, so keyword search is used. Check your network and reopen the document to re-index. (Your previous index is preserved.)',
  },
  // QA21(D-LOW): 임베딩 모델이 바뀌어 인덱스를 쓸 수 없는 경우. 위 tooltip 의 "네트워크를
  // 확인하라" 는 안내가 이 원인에는 틀렸다(모델을 새로 설치·삭제한 것이 원인) — 사용자를
  // 엉뚱한 곳으로 보내지 않도록 사유별로 분리한다.
  'qa.indexModelChanged': { ko: 'Embedding model changed', en: 'Embedding model changed' },
  'qa.indexModelChangedTooltip': {
    ko: 'The index was built with a different embedding model than the one now in use, so it cannot be used — keyword search is active. Reopen the document to re-index with the current model. (Your previous index is preserved.)',
    en: 'The index was built with a different embedding model than the one now in use, so it cannot be used — keyword search is active. Reopen the document to re-index with the current model. (Your previous index is preserved.)',
  },
  'qa.chunkTooltip': { ko: 'Embedding model: {model} | {count} chunks', en: 'Embedding model: {model} | {count} chunks' },
  'qa.ragActive': { ko: 'RAG semantic search is active. Ask a question about the document.', en: 'RAG semantic search is active. Ask a question about the document.' },
  'qa.emptyHint': { ko: 'Ask questions about the summary or original document', en: 'Ask questions about the summary or original document' },
  'qa.generating': { ko: 'Generating answer...', en: 'Generating answer...' },
  'qa.verifying': { ko: 'Preparing answer (checking sources)...', en: 'Preparing answer (checking sources)...' },
  'qa.answerFail': { ko: 'Failed to generate Q&A answer.', en: 'Failed to generate Q&A answer.' },
  'qa.waitIndexing': { ko: 'RAG is indexing. Please wait a moment and try again.', en: 'RAG is indexing. Please wait a moment and try again.' },
  'qa.charLimit': { ko: 'Question limited to {max} characters ({current}/{max})', en: 'Question limited to {max} characters ({current}/{max})' },
  'qa.placeholder': { ko: 'Type your question... (Enter: send, Shift+Enter: newline)', en: 'Type your question... (Enter: send, Shift+Enter: newline)' },
  'qa.inputAria': { ko: 'Question input', en: 'Question input' },
  'qa.stopAria': { ko: 'Stop answer', en: 'Stop answer' },
  'qa.answerCancelled': { ko: '(Answer cancelled)', en: '(Answer cancelled)' },
  // 비-abort 빈 응답(로컬 모델이 토큰 없이 done 등) 시 user 단독 orphan 방지용 placeholder.
  'qa.answerEmpty': { ko: '(No answer generated)', en: '(No answer generated)' },
  'qa.sendAria': { ko: 'Send question', en: 'Send question' },
  'qa.copyAnswer': { ko: 'Copy answer', en: 'Copy answer' },
  'qa.copied': { ko: 'Copied', en: 'Copied' },
  // ─── 다중 문서 컬렉션 Q&A (multi-doc Phase 2) ───
  'collection.customTemplateNotApplied': { ko: 'Custom summary templates are not applied to collection summaries; using Full summary instead.', en: 'Custom summary templates are not applied to collection summaries; using Full summary instead.' },
  'collection.toggle': { ko: 'Ask across documents', en: 'Ask across documents' },
  'collection.toggleHint': { ko: 'Search the open documents together', en: 'Search the open documents together' },
  'collection.members': { ko: 'Documents to search', en: 'Documents to search' },
  'collection.activeBadge': { ko: 'active', en: 'active' },
  'collection.statusModelMismatch': { ko: 'embedding model mismatch — excluded from search (summary OK)', en: 'embedding model mismatch — excluded from search (summary OK)' },
  'collection.statusNoIndex': { ko: 'no index — excluded from search (summary OK)', en: 'no index — excluded from search (summary OK)' },
  'collection.statusMissing': { ko: 'no saved session — excluded', en: 'no saved session — excluded' },
  'collection.noneSearchable': { ko: 'No searchable documents — answering from the current document only.', en: 'No searchable documents — answering from the current document only.' },
  'collection.searchingCount': { ko: 'Searching {count} documents', en: 'Searching {count} documents' },
  'collection.degradedNotice': { ko: 'Cross-document search was limited — answered from fewer documents (see exclusion reasons above).', en: 'Cross-document search was limited — answered from fewer documents (see exclusion reasons above).' },
  // 컬렉션 저장/목록 (multi-doc Phase 3 module-2)
  'collection.save': { ko: 'Save collection', en: 'Save collection' },
  'collection.saveNamePlaceholder': { ko: 'Collection name', en: 'Collection name' },
  'collection.saveConfirm': { ko: 'Save', en: 'Save' },
  'collection.saveCancel': { ko: 'Cancel', en: 'Cancel' },
  'collection.saved': { ko: 'Collection saved.', en: 'Collection saved.' },
  // QA23: 기존 컬렉션 갱신은 멤버 목록을 **교체**한다(빠진 문서는 컬렉션에서 사라진다). 신규 저장과
  // 같은 문구로 알리면 사용자가 축소를 인지할 수 없으므로, 대상 이름과 결과 문서 수를 함께 알린다.
  'collection.savedUpdate': { ko: "'{name}' 컬렉션을 갱신했습니다 (문서 {count}개).", en: "Updated the collection '{name}' ({count} documents)." },
  // QA23(D-LOW): 일시 I/O 오류를 "없음" 으로 단정하지 않는다(유일 사본이라 전량 소실로 읽힌다).
  'collection.loadFailed': { ko: 'Could not load saved collections (temporary file access error).', en: 'Could not load saved collections (temporary file access error).' },
  // QA23(D-MED): 컬렉션 LRU 축출은 완전 무음이었다 — 세션 LRU(QA21)와 대칭으로 고지한다.
  'collection.evictedNotice': { ko: 'Removed older collections beyond the storage limit: {names}', en: 'Removed older collections beyond the storage limit: {names}' },
  'collection.saveFail': { ko: 'Failed to save collection.', en: 'Failed to save collection.' },
  'collection.savedTitle': { ko: 'Saved collections', en: 'Saved collections' },
  // QA28(B2-Important): 삭제 실패 고지 — RecentDocuments 의 recent.deleteFail 과 대칭.
  'collection.deleteFail': { ko: 'Could not delete the collection. The file may be locked or you may lack permission.', en: 'Could not delete the collection. The file may be locked or you may lack permission.' },
  'collection.savedEmptyHint': { ko: 'Open several documents as tabs, summarize, then turn on "Ask across documents" to save the set as a collection.', en: 'Open several documents as tabs, summarize, then turn on "Ask across documents" to save the set as a collection.' },
  'collection.docCount': { ko: '{count} documents', en: '{count} documents' },
  'collection.open': { ko: 'Open', en: 'Open' },
  'collection.delete': { ko: 'Delete', en: 'Delete' },
  'collection.openFail': { ko: 'Could not open the collection.', en: 'Could not open the collection.' },
  'collection.busy': { ko: 'A generation/analysis is in progress. Try again when it finishes.', en: 'A generation/analysis is in progress. Try again when it finishes.' },
  'collection.partialOpen': { ko: 'Restored {opened} of {total} documents (the rest have no saved session).', en: 'Restored {opened} of {total} documents (the rest have no saved session).' },
  // 교차 문서 요약/비교 (multi-doc Phase 3 module-3)
  'collection.unified': { ko: '📑 Unified summary', en: '📑 Unified summary' },
  'collection.compare': { ko: '⚖ Compare', en: '⚖ Compare' },
  'collection.unifiedRequest': { ko: 'Write a unified summary of the selected documents', en: 'Write a unified summary of the selected documents' },
  'collection.compareRequest': { ko: 'Compare and contrast the selected documents', en: 'Compare and contrast the selected documents' },
  'collection.summaryNeedsMembers': { ko: 'Cross-document summary needs at least 2 documents.', en: 'Cross-document summary needs at least 2 documents.' },
  'collection.preparing': { ko: 'Preparing cross-document summary…', en: 'Preparing cross-document summary…' },
  'collection.preparingMember': { ko: 'Preparing summary: {name}…', en: 'Preparing summary: {name}…' },
  'collection.summaryFail': { ko: 'Failed to generate the cross-document summary.', en: 'Failed to generate the cross-document summary.' },
  'collection.unifiedResultTitle': { ko: '📑 Unified summary ({count} documents)', en: '📑 Unified summary ({count} documents)' },
  'collection.compareResultTitle': { ko: '⚖ Comparison ({count} documents)', en: '⚖ Comparison ({count} documents)' },

  // ─── ProgressBar ───
  'progress.seconds': { ko: '{s}s', en: '{s}s' },
  'progress.minutes': { ko: '{m}m {s}s', en: '{m}m {s}s' },
  'progress.minutesOnly': { ko: '{m}m', en: '{m}m' },
  'progress.imagePhase': { ko: 'Analyzing images', en: 'Analyzing images' },
  'progress.integratePhase': { ko: 'Generating integrated summary', en: 'Generating integrated summary' },
  'progress.chapterPhase': { ko: '{current}/{total} sections — {name}', en: '{current}/{total} sections — {name}' },
  'progress.sectionPhase': { ko: 'Processing {current}/{total} sections', en: 'Processing {current}/{total} sections' },
  'progress.summarizing': { ko: 'Summarizing', en: 'Summarizing' },
  'progress.processing': { ko: '{percent}% processing...', en: '{percent}% processing...' },
  'progress.remaining': { ko: '~{time} remaining', en: '~{time} remaining' },
  'progress.elapsed': { ko: '{time} elapsed', en: '{time} elapsed' },

  // ─── StatusBar ───
  'status.running': { ko: 'Running', en: 'Running' },
  'status.stopped': { ko: 'Stopped', en: 'Stopped' },
  'status.notInstalled': { ko: 'Not installed', en: 'Not installed' },

  // ─── SettingsPanel ───
  'settings.title': { ko: 'Settings', en: 'Settings' },
  'settings.provider': { ko: 'AI Provider', en: 'AI Provider' },
  'settings.ollamaLabel': { ko: 'Ollama (local, free)', en: 'Ollama (local, free)' },
  'settings.ollamaDesc': { ko: 'No internet required, data stays private', en: 'No internet required, data stays private' },
  'settings.claudeLabel': { ko: 'Claude API', en: 'Claude API' },
  'settings.claudeDesc': { ko: 'High quality summaries, API key required (paid)', en: 'High quality summaries, API key required (paid)' },
  'settings.openaiLabel': { ko: 'OpenAI API', en: 'OpenAI API' },
  'settings.openaiDesc': { ko: 'GPT-4o based summaries, API key required (paid)', en: 'GPT-4o based summaries, API key required (paid)' },
  'settings.geminiLabel': { ko: 'Google Gemini API', en: 'Google Gemini API' },
  'settings.geminiDesc': { ko: 'Gemini summaries · Vision · embeddings, API key required (free tier available)', en: 'Gemini summaries · Vision · embeddings, API key required (free tier available)' },
  'settings.enterApiKey': { ko: 'Enter API key below', en: 'Enter API key below' },
  'settings.keyRegistered': { ko: 'Key registered', en: 'Key registered' },
  'settings.model': { ko: 'Model', en: 'Model' },
  'settings.apiBilling': { ko: 'Charges apply based on API usage.', en: 'Charges apply based on API usage.' },
  'settings.noModels': { ko: 'No models installed in Ollama. Please add a model below.', en: 'No models installed in Ollama. Please add a model below.' },
  'settings.modelRecommend': { ko: 'gemma3 and qwen3.5 are recommended for Korean summaries.', en: 'gemma3 and qwen3.5 are recommended for Korean summaries.' },
  'settings.dismissPullError': { ko: 'Dismiss error message', en: 'Dismiss error message' },
  'settings.closePanel': { ko: 'Close settings panel', en: 'Close settings panel' },
  'settings.apiKeyMgmt': { ko: 'API Key Management', en: 'API Key Management' },
  'settings.apiKeyEncrypted': { ko: 'API keys are encrypted and stored locally.', en: 'API keys are encrypted and stored locally.' },
  'settings.apiKeyPlaceholder': { ko: 'Enter API key', en: 'Enter API key' },
  'settings.apiKeyMasked': { ko: '••••••••••••', en: '••••••••••••' },
  'settings.keySaved': { ko: '{provider} API key saved.', en: '{provider} API key saved.' },
  'settings.keySaveFail': { ko: 'Failed to save API key. Please try again.', en: 'Failed to save API key. Please try again.' },
  'settings.keychainUnavailable': { ko: 'Cannot store the API key because the OS keychain is unavailable. Please check your OS settings.', en: 'Cannot store the API key because the OS keychain is unavailable. Please check your OS settings.' },
  'settings.keyDeleted': { ko: 'API key deleted.', en: 'API key deleted.' },
  'settings.keyDeleteFail': { ko: 'Failed to delete API key. Please try again.', en: 'Failed to delete API key. Please try again.' },
  'settings.saveKeyFirst': { ko: 'Please save {provider} API key first.', en: 'Please save {provider} API key first.' },
  'settings.keyEmpty': { ko: 'Please enter an API key.', en: 'Please enter an API key.' },
  'settings.ollamaMgmt': { ko: 'Ollama Management', en: 'Ollama Management' },
  'settings.ollamaStatus': { ko: 'Status', en: 'Status' },
  'settings.ollamaRunning': { ko: '✅ Running', en: '✅ Running' },
  'settings.ollamaStopped': { ko: '⚠️ Stopped', en: '⚠️ Stopped' },
  'settings.installedModels': { ko: 'Installed models', en: 'Installed models' },
  'settings.recommendedModels': { ko: 'Recommended models (click to install):', en: 'Recommended models (click to install):' },
  'settings.koreanGood': { ko: 'Good Korean (~3.3GB)', en: 'Good Korean (~3.3GB)' },
  'settings.multilingual': { ko: 'Multilingual · multimodal (~3.4GB)', en: 'Multilingual · multimodal (~3.4GB)' },
  'settings.koreanSpecial': { ko: 'Korean specialized (~4.8GB)', en: 'Korean specialized (~4.8GB)' },
  'settings.generalLight': { ko: 'General lightweight', en: 'General lightweight' },
  'settings.ultraLight': { ko: 'Ultra light', en: 'Ultra light' },
  'settings.modelPlaceholder': { ko: 'Model name (e.g., gemma3)', en: 'Model name (e.g., gemma3)' },
  'settings.downloading': { ko: 'Downloading...', en: 'Downloading...' },
  'settings.addModel': { ko: 'Add model', en: 'Add model' },
  'settings.restartOllama': { ko: 'Restart Ollama', en: 'Restart Ollama' },
  'settings.restarting': { ko: 'Restarting Ollama...', en: 'Restarting Ollama...' },
  'settings.restartOk': { ko: 'Ollama restarted.', en: 'Ollama restarted.' },
  'settings.restartFail': { ko: 'Failed to restart Ollama. Please start it manually.', en: 'Failed to restart Ollama. Please start it manually.' },
  'settings.restartUnmanaged': {
    ko: 'Ollama is running outside this app, so it cannot be restarted from here. Please quit and relaunch the Ollama app yourself.',
    en: 'Ollama is running outside this app, so it cannot be restarted from here. Please quit and relaunch the Ollama app yourself.',
  },
  'settings.theme': { ko: 'Theme', en: 'Theme' },
  'settings.themeLight': { ko: 'Light', en: 'Light' },
  'settings.themeDark': { ko: 'Dark', en: 'Dark' },
  'settings.themeSystem': { ko: 'System', en: 'System' },
  'settings.language': { ko: 'Language', en: 'Language' },
  'settings.chunkSize': { ko: 'Chunk size', en: 'Chunk size' },
  'settings.customTemplates': { ko: 'Custom Summary Templates', en: 'Custom Summary Templates' },
  'settings.customTemplatesDesc': { ko: 'Define your own summary prompts. They appear alongside the 3 built-in types in the summary type selector.', en: 'Define your own summary prompts. They appear alongside the 3 built-in types in the summary type selector.' },
  'settings.templateName': { ko: 'Template name', en: 'Template name' },
  'settings.templateNamePlaceholder': { ko: 'e.g. Extract action items', en: 'e.g. Extract action items' },
  'settings.templatePrompt': { ko: 'Template prompt', en: 'Template prompt' },
  'settings.templatePromptPlaceholder': { ko: 'e.g. List the action items that need to be done from the following document.', en: 'e.g. List the action items that need to be done from the following document.' },
  'settings.templateDelete': { ko: 'Delete template', en: 'Delete template' },
  'settings.templateAdd': { ko: 'Add template', en: 'Add template' },
  'settings.templateStrategy': { ko: 'Processing', en: 'Processing' },
  'settings.templateStrategySingle': { ko: 'Single pass (fast; long docs partly skipped)', en: 'Single pass (fast; long docs partly skipped)' },
  'settings.templateStrategyChunked': { ko: 'Chunk & integrate (covers long docs; slower)', en: 'Chunk & integrate (covers long docs; slower)' },
  'settings.templateIncomplete': { ko: 'Enter both a name and a prompt for each template. (Entries with only one filled are not saved.)', en: 'Enter both a name and a prompt for each template. (Entries with only one filled are not saved.)' },
  // QA22(C-MED): 이전에는 이 값이 거부돼도 저장이 "성공" 으로 보이고, 이후 모든 생성이 미번역
  // 내부 문자열과 함께 실패하는데 StatusBar 는 "연결됨" 을 표시했다(두 경로가 다른 값을 봄).
  'settings.invalidOllamaUrl': {
    ko: 'Invalid Ollama URL. It must be a local address including the scheme, e.g. http://localhost:11434',
    en: 'Invalid Ollama URL. It must be a local address including the scheme, e.g. http://localhost:11434',
  },
  'settings.imageAnalysis': { ko: 'Image Analysis', en: 'Image Analysis' },
  'settings.imageAnalysisLabel': { ko: 'Auto-analyze document images', en: 'Auto-analyze document images' },
  'settings.imageAnalysisDesc': { ko: 'Requires Vision model (llava, Claude, GPT-4o, Gemini, etc.)', en: 'Requires Vision model (llava, Claude, GPT-4o, Gemini, etc.)' },
  'settings.ocrTitle': { ko: 'Scanned PDF OCR', en: 'Scanned PDF OCR' },
  'settings.ocrLabel': { ko: 'Auto text recognition for scanned PDFs (OCR)', en: 'Auto text recognition for scanned PDFs (OCR)' },
  'settings.ocrDesc': {
    ko: 'Recognizes text in scanned PDFs using Vision models. Time and API costs increase with page count.',
    en: 'Recognizes text in scanned PDFs using Vision models. Time and API costs increase with page count.',
  },
  'settings.answerVerificationTitle': { ko: 'Q&A Answer Verification', en: 'Q&A Answer Verification' },
  'settings.answerVerificationLabel': { ko: 'Auto-verify answer sources', en: 'Auto-verify answer sources' },
  'settings.answerVerificationDesc': {
    ko: 'Cross-checks draft answers against the source and silently refines if hallucinations are detected. Slightly longer response time and extra embedding calls (minor OpenAI cost increase).',
    en: 'Cross-checks draft answers against the source and silently refines if hallucinations are detected. Slightly longer response time and extra embedding calls (minor OpenAI cost increase).',
  },
  'settings.savedBtn': { ko: '✅ Saved', en: '✅ Saved' },
  'settings.saveBtn': { ko: 'Save settings', en: 'Save settings' },
  'settings.aiBusyNotice': {
    ko: '⚙️ AI is generating. Theme/language can be changed now, but AI provider, model, Ollama URL, and chunk size are locked until it finishes.',
    en: '⚙️ AI is generating. Theme/language can be changed now, but AI provider, model, Ollama URL, and chunk size are locked until it finishes.',
  },
  'settings.noChanges': { ko: 'No changes', en: 'No changes' },
  'settings.notInstalled': { ko: 'Not installed', en: 'Not installed' },

  // ─── OllamaSetupWizard ───
  'setup.title': { ko: 'MHC Document Analyzer Setup', en: 'MHC Document Analyzer Setup' },
  'setup.desc': { ko: 'This app uses local AI (Ollama) to summarize documents.', en: 'This app uses local AI (Ollama) to summarize documents.' },
  'setup.autoInstall': { ko: 'The following will be installed automatically:', en: 'The following will be installed automatically:' },
  'setup.start': { ko: 'Start setup', en: 'Start setup' },
  'setup.done': { ko: 'Setup complete!', en: 'Setup complete!' },
  'setup.otherProvider': { ko: 'Use other AI Provider', en: 'Use other AI Provider' },
  'setup.statusPending': { ko: 'pending', en: 'pending' },
  'setup.statusRunning': { ko: 'in progress', en: 'in progress' },
  'setup.statusDone': { ko: 'done', en: 'done' },
  'setup.statusError': { ko: 'failed', en: 'failed' },
  'setup.languageGroup': { ko: 'Language', en: 'Language' },
  'setup.ollamaCheck': { ko: 'Check Ollama installation', en: 'Check Ollama installation' },
  'setup.ollamaStart': { ko: 'Start Ollama service', en: 'Start Ollama service' },
  'setup.downloadBase': { ko: 'Download base AI model ({model})', en: 'Download base AI model ({model})' },
  'setup.downloadKorean': { ko: 'Download Korean-specialized AI model ({model})', en: 'Download Korean-specialized AI model ({model})' },
  'setup.downloadEmbed': { ko: 'Download RAG embedding model ({model})', en: 'Download RAG embedding model ({model})' },
  'setup.koreanOption': { ko: 'Also install the Korean-specialized model ({model}, ~4.8GB)', en: 'Also install the Korean-specialized model ({model}, ~4.8GB)' },
  'setup.koreanOptionDesc': { ko: 'Recommended if you mainly analyze Korean documents. The base model (gemma3) also supports Korean, but this model produces better Korean summaries. You can add it anytime later in Settings → Model Management.', en: 'Recommended if you mainly analyze Korean documents. The base model (gemma3) also supports Korean, but this model produces better Korean summaries. You can add it anytime later in Settings → Model Management.' },
  'setup.checkingOllama': { ko: 'Checking Ollama installation...', en: 'Checking Ollama installation...' },
  'setup.installingOllama': { ko: 'Downloading and installing Ollama. Please approve the admin prompt if it appears.', en: 'Downloading and installing Ollama. Please approve the admin prompt if it appears.' },
  'setup.ollamaInstallFail': { ko: 'Failed to install Ollama.', en: 'Failed to install Ollama.' },
  'setup.startingOllama': { ko: 'Starting Ollama service...', en: 'Starting Ollama service...' },
  'setup.ollamaStartFail': { ko: 'Cannot start Ollama service. Restart PC or start Ollama manually.', en: 'Cannot start Ollama service. Restart PC or start Ollama manually.' },
  'setup.downloadingModel': { ko: 'Downloading {label}. This may take a few minutes depending on model size...', en: 'Downloading {label}. This may take a few minutes depending on model size...' },
  'setup.downloadingModelLabel.base': { ko: 'base AI model ({model})', en: 'base AI model ({model})' },
  'setup.downloadingModelLabel.korean': { ko: 'Korean-specialized AI model ({model})', en: 'Korean-specialized AI model ({model})' },
  'setup.downloadingModelLabel.embed': { ko: 'RAG embedding model ({model})', en: 'RAG embedding model ({model})' },
  'setup.modelDownloadFail': { ko: 'Failed to download {model} model.', en: 'Failed to download {model} model.' },
  'setup.noModels': { ko: 'No models installed. Check network and try again.', en: 'No models installed. Check network and try again.' },
  'setup.unknownError': { ko: 'An unknown error occurred.', en: 'An unknown error occurred.' },
  'setup.hint.notFound': { ko: 'Ollama not found.', en: 'Ollama not found.' },
  'setup.hint.installFail': { ko: 'Installation error. Check admin permissions and network.', en: 'Installation error. Check admin permissions and network.' },
  'setup.hint.notRunning': { ko: 'Ollama service failed to start. Restart PC and try again.', en: 'Ollama service failed to start. Restart PC and try again.' },
  'setup.hint.modelNotFound': { ko: 'Model not found. Check network and try again.', en: 'Model not found. Check network and try again.' },
  'setup.hint.pullFail': { ko: 'Model download failed. Check disk space (min 4GB for the default setup, ~9GB with the Korean-specialized model) and network.', en: 'Model download failed. Check disk space (min 4GB for the default setup, ~9GB with the Korean-specialized model) and network.' },
  'setup.downloadReady': { ko: 'Preparing download...', en: 'Preparing download...' },
  // ─── main 프로세스 구조화 진행 이벤트 (R44: R43 후속 F3/F8) — translateMainProgress 가 매핑 ───
  'mainprog.downloadingInstaller': { ko: 'Downloading the Ollama installer...', en: 'Downloading the Ollama installer...' },
  'mainprog.verifyingDownload': { ko: 'Verifying download integrity...', en: 'Verifying download integrity...' },
  'mainprog.installerWindow': { ko: 'The Ollama installer window will open. Please complete the installation...', en: 'The Ollama installer window will open. Please complete the installation...' },
  'mainprog.confirmingInstall': { ko: 'Confirming installation...', en: 'Confirming installation...' },
  'mainprog.installingBrew': { ko: 'Installing Ollama (Homebrew)...', en: 'Installing Ollama (Homebrew)...' },
  'mainprog.brewFallback': { ko: 'Homebrew failed. Trying direct download...', en: 'Homebrew failed. Trying direct download...' },
  'mainprog.pulling': { ko: 'Downloading model... {percent}', en: 'Downloading model... {percent}' },
  'mainprog.pullingManifest': { ko: 'Checking model info...', en: 'Checking model info...' },
  'mainprog.verifying': { ko: 'Verifying integrity...', en: 'Verifying integrity...' },
  'mainprog.writing': { ko: 'Finalizing installation...', en: 'Finalizing installation...' },
  'mainprog.success': { ko: 'Download complete!', en: 'Download complete!' },
  'mainprog.preparing': { ko: 'Preparing model download...', en: 'Preparing model download...' },
  // ─── main 파일 열기(file:open-pdf · file:open-path) 거부 사유 — QA34: 종전엔 한국어 원문이 영어 UI 에 그대로 ───
  'mainerr.fileUnsupported': { ko: 'Only these file types can be opened: {list}.', en: 'Only these file types can be opened: {list}.' },
  'mainerr.fileSymlink': { ko: 'Symbolic links cannot be opened.', en: 'Symbolic links cannot be opened.' },
  'mainerr.fileNotRegular': { ko: 'This is not a regular file.', en: 'This is not a regular file.' },
  'mainerr.fileTooLarge': { ko: 'The file is too large (max 100MB).', en: 'The file is too large (max 100MB).' },
  'mainerr.fileInvalidPath': { ko: 'Invalid path.', en: 'Invalid path.' },
  'mainerr.fileNotFound': { ko: 'The file could not be found.', en: 'The file could not be found.' },
  'mainerr.fileNotFoundMoved': { ko: 'The file could not be found (it may have been moved or deleted).', en: 'The file could not be found (it may have been moved or deleted).' },
  'mainerr.fileAccessDenied': { ko: 'Access to the file was denied.', en: 'Access to the file was denied.' },
  'mainerr.fileOpenFailed': { ko: 'The file could not be opened.', en: 'The file could not be opened.' },
  // ─── main 프로세스 구조화 에러 (pullModel errorKey) — translateMainError 가 매핑 ───
  'mainerr.pullInProgress': { ko: 'Another model download is already in progress. Please try again after it finishes.', en: 'Another model download is already in progress. Please try again after it finishes.' },
  'mainerr.pullTimeout': { ko: 'Model download timed out (30 min). Check your network and try again.', en: 'Model download timed out (30 min). Check your network and try again.' },
  'mainerr.pullFailed': { ko: 'Model download failed: {detail}', en: 'Model download failed: {detail}' },
  'mainerr.pullCancelled': { ko: 'Model download was cancelled.', en: 'Model download was cancelled.' },
  // R45(R44 후속): install 계열 에러도 errorKey 이행 — 영어 UI 에 한국어 설치 에러가 남던 잔존 경로
  'mainerr.unsupportedOs': { ko: 'Unsupported operating system.', en: 'Unsupported operating system.' },
  'mainerr.installerTooSmall': { ko: 'The downloaded file is abnormally small ({size} bytes). Check your network and try again.', en: 'The downloaded file is abnormally small ({size} bytes). Check your network and try again.' },
  'mainerr.signatureInvalid': { ko: 'Ollama installer signature verification failed ({reason}). Installation was stopped for safety. Please download and install manually from https://ollama.com.', en: 'Ollama installer signature verification failed ({reason}). Installation was stopped for safety. Please download and install manually from https://ollama.com.' },
  'mainerr.installedButNotFound': { ko: 'Ollama was installed but the executable could not be found. Restart your PC or install manually from https://ollama.com.', en: 'Ollama was installed but the executable could not be found. Restart your PC or install manually from https://ollama.com.' },
  'mainerr.installFailed': { ko: 'Installation failed: {detail}. Please install manually from https://ollama.com.', en: 'Installation failed: {detail}. Please install manually from https://ollama.com.' },
  'setup.manualInstall': { ko: 'Manual install:', en: 'Manual install:' },
  'setup.cancel': { ko: 'Cancel and use another provider', en: 'Cancel and use another provider' },
  // QA7: AI 스트리밍 에러 errorKey — 이전엔 ai-service 가 한국어 원문만 실어 영어 UI 에 노출됐다.
  'mainerr.cloudQuota': { ko: 'Your {provider} usage quota has been exceeded. Check your billing/plan and try again.', en: 'Your {provider} usage quota has been exceeded. Check your billing/plan and try again.' },
  'mainerr.cloudRateLimit': { ko: '{provider} rate limit exceeded. Please try again in a moment.', en: '{provider} rate limit exceeded. Please try again in a moment.' },
  'mainerr.cloudOverloaded': { ko: '{provider} servers are temporarily overloaded. Please try again in a moment.', en: '{provider} servers are temporarily overloaded. Please try again in a moment.' },
  'mainerr.apiKeyMissing': { ko: 'No {provider} API key is configured.', en: 'No {provider} API key is configured.' },
  'mainerr.settingsReadFailed': { ko: 'Could not read your settings, so the request was not processed. Please try again in a moment.', en: 'Could not read your settings, so the request was not processed. Please try again in a moment.' },
  'mainerr.apiKeyInvalid': { ko: 'The API key is not valid.', en: 'The API key is not valid.' },
  'mainerr.responseBlocked': { ko: 'The AI response was blocked (reason: {reason}). Check the document content or output limits.', en: 'The AI response was blocked (reason: {reason}). Check the document content or output limits.' },
  // QA8(B-MED): 토큰 0개로 정상 종료(HTTP 200)한 스트림 — Gemini 는 blockReason 으로 잡혔지만
  // Claude/OpenAI 는 content_filter/빈 delta 로 조용히 빈 요약을 "완료"로 표시했다(무음 no-op).
  'mainerr.emptyResponse': { ko: 'The AI returned an empty response. Please retry, or check the summary type and document.', en: 'The AI returned an empty response. Please retry, or check the summary type and document.' },
  'mainerr.streamNoResponse': { ko: 'The AI server stopped responding (no data for 60s).', en: 'The AI server stopped responding (no data for 60s).' },
  'mainerr.streamDisconnected': { ko: 'The AI stream connection was lost.', en: 'The AI stream connection was lost.' },
  'mainerr.streamTimeout': { ko: 'The AI server response timed out (5 min).', en: 'The AI server response timed out (5 min).' },
  'mainerr.streamConnectFailed': { ko: 'Could not connect to the AI server. Check that it is running and that the address and network are correct.', en: 'Could not connect to the AI server. Check that it is running and that the address and network are correct.' },
  'mainerr.streamTooLarge': { ko: 'The AI response was too large and was stopped (over 50MB). Narrow the document range or try a different model.', en: 'The AI response was too large and was stopped (over 50MB). Narrow the document range or try a different model.' },
  'mainerr.streamLineTooLarge': { ko: 'The AI response was malformed and was stopped (abnormally large data). Please try again in a moment.', en: 'The AI response was malformed and was stopped (abnormally large data). Please try again in a moment.' },
  'mainerr.apiHttpError': { ko: 'API request failed: HTTP {status}', en: 'API request failed: HTTP {status}' },
  // QA30(A-F1): TTL 스위퍼가 회수한 요청 — 사용자 취소(코드 ABORTED, 배너 억제)와 달리
  // 반드시 설명이 떠야 한다. 이전엔 둘이 같은 코드라 스피너만 사라지고 아무 안내가 없었다.
  'mainerr.streamStalled': { ko: 'The AI response stalled with no progress for 10 minutes and was stopped. Check your AI server and try again.', en: 'The AI response stalled with no progress for 10 minutes and was stopped. Check your AI server and try again.' },
  'mainerr.streamMaxDuration': { ko: 'The AI request exceeded the maximum allowed duration (3 hours) and was stopped. Narrow the document range or try a lighter model.', en: 'The AI request exceeded the maximum allowed duration (3 hours) and was stopped. Narrow the document range or try a lighter model.' },
  // QA30(A-F2): 기본 프로바이더 Ollama 만 에러 바디를 읽지 않아 버려지던 두 사유.
  'mainerr.ollamaModelNotFound': { ko: 'The model "{model}" is not installed in Ollama. Download it in Settings and try again.', en: 'The model "{model}" is not installed in Ollama. Download it in Settings and try again.' },
  'mainerr.ollamaOutOfMemory': { ko: 'The model could not be loaded into memory ({detail}). Choose a smaller model or close other applications, then try again.', en: 'The model could not be loaded into memory ({detail}). Choose a smaller model or close other applications, then try again.' },

  // ─── 세션 영속화 (session-persistence) ───
  'recent.title': { ko: 'Recent Documents', en: 'Recent Documents' },
  'recent.empty': { ko: 'No saved sessions yet. Analyzed documents will appear here.', en: 'No saved sessions yet. Analyzed documents will appear here.' },
  'recent.open': { ko: 'Open', en: 'Open' },
  'recent.delete': { ko: 'Delete session', en: 'Delete session' },
  'recent.indexed': { ko: '{count} chunks indexed', en: '{count} chunks indexed' },
  // QA24(C-M2): "불러오지 못함" 과 "정말 없음" 을 구분 — collection.loadFailed 와 같은 계약.
  'recent.loadFailed': { ko: 'Could not load the recent documents list. Your sessions are still there.', en: 'Could not load the recent documents list. Your sessions are still there.' },
  'recent.openedWithoutFile': { ko: 'The original file was not found, so only the saved analysis was opened. Your summary and Q&A are intact; only the source-document view is unavailable.', en: 'The original file was not found, so only the saved analysis was opened. Your summary and Q&A are intact; only the source-document view is unavailable.' },
  'recent.openFail': { ko: 'Could not open the document. The original file may have been moved or deleted.', en: 'Could not open the document. The original file may have been moved or deleted.' },
  'recent.deleteFail': { ko: 'Could not delete the session. Please try again.', en: 'Could not delete the session. Please try again.' },
  // 전체 문서 검색 (cross-session search)
  'search.title': { ko: 'Search documents', en: 'Search documents' },
  'search.placeholder': { ko: 'Search across all saved documents...', en: 'Search across all saved documents...' },
  'search.button': { ko: 'Search', en: 'Search' },
  'search.searching': { ko: 'Searching...', en: 'Searching...' },
  'search.noResults': { ko: 'No results for "{query}".', en: 'No results for "{query}".' },
  'search.resultsCount': { ko: '{count} results found', en: '{count} results found' },
  'search.inSummary': { ko: 'in summary', en: 'in summary' },
  'search.summaryLabel': { ko: 'Summary', en: 'Summary' },
  'search.modeLabel': { ko: 'Search mode', en: 'Search mode' },
  'search.modeKeyword': { ko: 'Keyword', en: 'Keyword' },
  'search.modeSemantic': { ko: 'Semantic', en: 'Semantic' },
  'search.modeHint': { ko: 'Keyword: exact terms / Semantic: similar meaning (embeddings)', en: 'Keyword: exact terms / Semantic: similar meaning (embeddings)' },
  'search.noEmbedModel': { ko: 'Semantic search needs an embedding model — install nomic-embed-text in Ollama or use keyword search.', en: 'Semantic search needs an embedding model — install nomic-embed-text in Ollama or use keyword search.' },
  'search.embedFailed': { ko: 'Failed to embed the query. Please try again.', en: 'Failed to embed the query. Please try again.' },
  'settings.keyUnknown': { ko: 'Cannot verify key (please reopen in a moment)', en: 'Cannot verify key (please reopen in a moment)' },
  'search.corrupted': { ko: '{count} document(s) were skipped because their index is damaged. Reopen them to rebuild the index.', en: '{count} document(s) were skipped because their index is damaged. Reopen them to rebuild the index.' },
  'search.excluded': { ko: '{count} document(s) excluded (different embedding model)', en: '{count} document(s) excluded (different embedding model)' },
  'search.cloudEmbedBadge': { ko: '🌐 Sent to {provider}', en: '🌐 Sent to {provider}' },
  'search.cloudEmbedTooltip': { ko: 'Semantic search sends your query and document text to {provider} servers for embedding. Use an Ollama embedding model to keep it fully local.', en: 'Semantic search sends your query and document text to {provider} servers for embedding. Use an Ollama embedding model to keep it fully local.' },
  'settings.dataSection': { ko: 'Session Data', en: 'Session Data' },
  'settings.persistToggle': { ko: 'Save sessions & cache', en: 'Save sessions & cache' },
  'settings.persistDesc': { ko: 'Save summaries, Q&A, and the search index per document to restore them on reopen (no re-summarize/re-embed).', en: 'Save summaries, Q&A, and the search index per document to restore them on reopen (no re-summarize/re-embed).' },
  'settings.storageUsage': { ko: 'Stored: {count} documents · {size}', en: 'Stored: {count} documents · {size}' },
  'settings.storageLocation': { ko: 'Location: {dir}', en: 'Location: {dir}' },
  'settings.clearSessions': { ko: 'Clear all', en: 'Clear all' },
  'settings.clearConfirm': { ko: 'Delete all saved sessions? This cannot be undone.', en: 'Delete all saved sessions? This cannot be undone.' },
  // ─── 자동 업데이트 (electron-updater) ───
  'update.section': { ko: 'App Updates', en: 'App Updates' },
  'update.currentVersion': { ko: 'Current version {version}', en: 'Current version {version}' },
  'update.autoCheckLabel': { ko: 'Check for updates on startup', en: 'Check for updates on startup' },
  'update.autoCheckDesc': {
    ko: 'Only the check is automatic — downloads always start after you approve them.',
    en: 'Only the check is automatic — downloads always start after you approve them.',
  },
  'update.checkBtn': { ko: 'Check now', en: 'Check now' },
  'update.checking': { ko: 'Checking for updates...', en: 'Checking for updates...' },
  'update.upToDate': { ko: 'You are on the latest version.', en: 'You are on the latest version.' },
  // QA19(D-LOW): 보간 파라미터 뒤에 조사를 붙이면 항상 비문이 된다("… 0.31.32 을") — 버전
  // 끝자리 발음의 받침 유무로 을/를이 갈리는데 사전에는 조사 처리기가 없다. 조사를 쓰지 않는
  // 어순(괄호 부기)으로 통일하고, 버전 미상일 때를 위한 무-버전 변형을 함께 둔다.
  'update.available': { ko: 'A new version is available ({version})', en: 'A new version is available ({version})' },
  'update.availableNoVersion': { ko: 'A new version is available.', en: 'A new version is available.' },
  'update.downloadBtn': { ko: 'Download', en: 'Download' },
  // QA23: 설치 요청 ~ 종료 사이 구간. 이전에는 상태가 없어 버튼이 "재시작하여 설치" 그대로였고,
  // 재클릭이 내부 잠금에 조용히 폐기됐다(피드백 0).
  'update.installing': { ko: 'Preparing to install… the app will restart shortly.', en: 'Preparing to install… the app will restart shortly.' },
  'update.errorGeneric': { ko: 'The update failed.', en: 'The update failed.' },
  'update.retryBtn': { ko: 'Retry', en: 'Retry' },
  'update.downloading': { ko: 'Downloading... {percent}%', en: 'Downloading... {percent}%' },
  // QA19(D-MED): 라이브 영역(role="status")에는 퍼센트를 넣지 않는다 — 정수 1단위로 갱신돼
  // 스크린리더가 최대 100회 낭독한다. 숫자는 progressbar 의 aria-valuenow 와 시각 텍스트에만.
  'update.downloadingLive': { ko: 'Downloading the update…', en: 'Downloading the update…' },
  'update.downloadProgressAria': { ko: 'Update download progress', en: 'Update download progress' },
  'update.downloaded': { ko: 'Version {version} is ready — restart to apply.', en: 'Version {version} is ready — restart to apply.' },
  'update.installBtn': { ko: 'Restart and install', en: 'Restart and install' },
  'update.installNotice': {
    ko: 'The app will close to install. Summaries and Q&A in progress are saved before it closes.',
    en: 'The app will close to install. Summaries and Q&A in progress are saved before it closes.',
  },
  'update.unsupported': {
    ko: 'Auto-update works only in the installed Windows app (disabled while running from source).',
    en: 'Auto-update works only in the installed Windows app (disabled while running from source).',
  },
  'update.bannerReady': { ko: 'A new version is ready to install ({version})', en: 'A new version is ready to install ({version})' },
  'update.bannerReadyNoVersion': { ko: 'A new version is ready to install.', en: 'A new version is ready to install.' },
  // QA19(A-MED): 설치는 앱을 종료시키므로 생성 중에는 막는다(세션 삭제와 동일 등급의 파괴적 조작).
  'update.installBlockedBusy': { ko: 'You can install once the summary/answer finishes.', en: 'You can install once the summary/answer finishes.' },
  'update.bannerDismiss': { ko: 'Dismiss update notice', en: 'Dismiss update notice' },
  // main updater errorKey (mainerr.* 규약) — classifyUpdateError 가 반환하는 4종
  'mainerr.updateNetwork': {
    ko: 'Could not reach the update server. Check your network and try again.',
    en: 'Could not reach the update server. Check your network and try again.',
  },
  'mainerr.updateNoFeed': {
    ko: 'No update information was found. Try again later or download it directly from the GitHub releases page.',
    en: 'No update information was found. Try again later or download it directly from the GitHub releases page.',
  },
  'mainerr.updateChecksum': {
    ko: 'The downloaded file failed its integrity check. Please try again.',
    en: 'The downloaded file failed its integrity check. Please try again.',
  },
  'mainerr.updateUnknown': { ko: 'The update failed.', en: 'The update failed.' },
  // 2026-08-07 실기기 검증: 받아둔 인스톨러가 사라지면(백신 격리 등) 앱이 조용히 꺼졌다.
  // 이제 종료 전에 막고 이 문구로 알린다 — 회복 수단(재다운로드)까지 함께 안내.
  // QA28: 판정이 "존재"에서 "실행 가능"으로 넓어졌다(0바이트·손상 파일도 여기 착지) — 문구도 함께.
  'mainerr.updateInstallerMissing': {
    ko: 'The downloaded installer is missing or corrupted (antivirus may have quarantined it). Please download it again.',
    en: 'The downloaded installer is missing or corrupted (antivirus may have quarantined it). Please download it again.',
  },
  'mainerr.updateInstallFailed': {
    ko: 'The installer could not be started. The downloaded file may have been quarantined by antivirus or removed — download it again, or install manually from the releases page.',
    en: 'The installer could not be started. The downloaded file may have been quarantined by antivirus or removed — download it again, or install manually from the releases page.',
  },
  'session.restoreFailedNotice': { ko: 'Could not load this document’s saved session. Saving is paused so your existing summary and Q&A are not overwritten — reopen the document to retry the restore.', en: 'Could not load this document’s saved session. Saving is paused so your existing summary and Q&A are not overwritten — reopen the document to retry the restore.' },
  'session.saveFailedNotice': { ko: 'Session saving keeps failing. Check disk space/permissions — summaries, Q&A, and the search index are not being persisted and will be lost on reopen.', en: 'Session saving keeps failing. Check disk space/permissions — summaries, Q&A, and the search index are not being persisted and will be lost on reopen.' },
  // QA21(C-MED): LRU 정리 통지. 이전엔 완전 무음이라 "요약이 왜 사라졌는지" 알 방법이 없었다.
  'session.evictedNotice': { ko: 'Cleaned up {count} old analyses to stay within the storage limit ({names}). Their summaries, Q&A, and search index will need to be regenerated when reopened.', en: 'Cleaned up {count} old analyses to stay within the storage limit ({names}). Their summaries, Q&A, and search index will need to be regenerated when reopened.' },
} as const;

export type TranslationKey = keyof typeof _translations;

// ─── 템플릿 치환 ───

// 개발 중 누락 키/파라미터를 즉시 탐지하기 위한 dev-only 경고 (프로덕션 번들에서는 제거됨).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _isDev = typeof (import.meta as any)?.env?.DEV === 'boolean' ? (import.meta as any).env.DEV : false;
const _warnedMissingKeys = new Set<string>();
const _warnedMissingParams = new Set<string>();

function warnOnce(bucket: Set<string>, id: string, message: string): void {
  if (!_isDev) return;
  if (bucket.has(id)) return;
  bucket.add(id);
  console.warn(message);
}

function interpolate(template: string, params?: Record<string, string | number>, key?: string): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    // v0.18.19 patch R32 P3: `params[name] === undefined` 는 inherited 속성에 대해 false 인데,
    // `params['toString']` 같은 prototype 속성은 함수로 떨어져 `String(...)` 으로 함수 소스가
    // 템플릿에 주입되는 UI 오염 경로가 있었음. `Object.prototype.hasOwnProperty.call` 로
    // own property 만 카운트하여 prototype 누출 차단 (Surface 3 P4).
    //
    // v0.18.19 patch R34 P2 (R33 회귀 fix): hasOwnProperty 만 검사하면 own property 의 값이
    // `undefined` 인 경우 `String(undefined)` = `"undefined"` 가 UI 에 박혀 사용자가 missing
    // param 임을 식별 못함. 두 가드를 AND 로 결합 (Surface 3 P4).
    if (!Object.prototype.hasOwnProperty.call(params, name) || params[name] === undefined) {
      warnOnce(_warnedMissingParams, `${key ?? ''}:${name}`, `[i18n] missing param "${name}" for key "${key ?? '?'}"`);
      return `{${name}}`;
    }
    return String(params[name]);
  });
}

// ─── 번역 함수 ───

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const lang = useAppStore.getState().settings.uiLanguage || 'en';
  const entry = _translations[key];
  if (!entry) {
    warnOnce(_warnedMissingKeys, key, `[i18n] missing translation key "${key}"`);
    // v0.18.19 patch R32 P3: production 에서도 raw 키가 UI 에 노출되던 결함 보완.
    // 미정의 키는 키 자체로 fallback 하되, 적어도 dot-segment 의 마지막 부분만 노출하여
    // 사용자가 `app.modelHint` 같은 내부 식별자 전체를 보는 경험을 약화. dev/prod 동일 동작.
    return key.split('.').pop() ?? key;
  }
  return interpolate(entry[lang] || entry['en'] || entry['ko'], params, key);
}

// ─── main 프로세스 구조화 메시지 번역 (R44: R43 후속 F3/F8) ───

/** main 이 setup:progress 로 보내는 구조화 진행 이벤트 (ollama-pull-progress.ts 와 동형) */
export interface MainProgressEvent {
  key: string;
  params?: Record<string, string>;
  /** R45: 발신원 — 수신자가 자기 작업(install vs 특정 모델 pull)의 이벤트만 필터링 */
  source?: 'install' | 'pull';
  model?: string;
}

/**
 * 구조화 진행 이벤트 → 현재 UI 언어 문자열.
 * 'raw' 는 매핑 불가 원문 passthrough. 미지 키는 t() 의 missing-key 정책을 따른다.
 */
export function translateMainProgress(ev: MainProgressEvent): string {
  if (!ev || typeof ev !== 'object' || typeof ev.key !== 'string') return '';
  if (ev.key === 'raw') return ev.params?.text ?? '';
  return t(`mainprog.${ev.key}` as TranslationKey, ev.params);
}

/**
 * main 의 errorKey 동반 실패 결과 → 현재 UI 언어 에러 문자열.
 * errorKey 가 없으면(구버전/미매핑) main 의 error 원문 → 호출자 fallback 순.
 */
export function translateMainError(
  result: { error?: string; errorKey?: string; errorParams?: Record<string, string> },
  fallback: string,
): string {
  if (result.errorKey) return t(`mainerr.${result.errorKey}` as TranslationKey, result.errorParams);
  return result.error || fallback;
}

// ─── React 훅 ───

/**
 * 컴포넌트 내에서 반응형으로 번역을 읽는 훅.
 *
 * 반환 함수는 `lang` 이 변경될 때만 새 참조를 만든다 (useMemo 안정화).
 * 이 덕분에 `useEffect([..., tr])` 에 tr 를 포함해도 매 렌더 재실행되지 않는다.
 * 일반적으로 JSX 안에서 직접 `tr('key')` 로 사용하거나, effect deps 에 tr 를 포함시킨다.
 */
export function useT(): (key: TranslationKey, params?: Record<string, string | number>) => string {
  const lang = useAppStore((s) => s.settings.uiLanguage);
  return useMemo(() => {
    return (key: TranslationKey, params?: Record<string, string | number>) => {
      const entry = _translations[key];
      if (!entry) {
        warnOnce(_warnedMissingKeys, key, `[i18n] missing translation key "${key}"`);
        // R32 P3 (위 t() 와 동일 정책): 마지막 segment 만 fallback.
        return key.split('.').pop() ?? key;
      }
      return interpolate(entry[lang] || entry['en'] || entry['ko'], params, key);
    };
  }, [lang]);
}
