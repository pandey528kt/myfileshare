"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, ChevronDown, Copy, FileArchive, FileImage, FileText, FolderUp, LockKeyhole, ShieldCheck, Sparkles, Upload, X } from "lucide-react";

type SharedFile = { name: string; size: string; kind: string };

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext ?? "")) return FileImage;
  if (["zip", "rar", "7z", "tar"].includes(ext ?? "")) return FileArchive;
  return FileText;
}

export default function Home() {
  const picker = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [passwordEnabled, setPasswordEnabled] = useState(true);
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState("7 days");
  const [busy, setBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const selected = Array.from(list);
    setFiles((current) => [
      ...current,
      ...selected.map((file) => ({ name: file.name, size: formatSize(file.size), kind: file.type || "File" })),
    ]);
    setError("");
    setShareUrl("");
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function createShare() {
    if (!files.length) {
      setError("Choose at least one file to create a share link.");
      picker.current?.focus();
      return;
    }
    if (passwordEnabled && password.trim().length < 4) {
      setError("Add a password with at least 4 characters, or turn protection off.");
      return;
    }
    setBusy(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 650));
    setShareUrl(`${window.location.origin}/s/${Math.random().toString(36).slice(2, 10)}`);
    setBusy(false);
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access is unavailable. Select and copy the link instead.");
    }
  }

  return (
    <main className="share-page">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Parcel home"><span className="brand-mark"><ArrowDownToLine size={17} strokeWidth={2.5} /></span>parcel<span className="brand-period">.</span></a>
        <div className="topbar-right"><span className="secure-note"><ShieldCheck size={15} /> Private by default</span><a className="help-link" href="#how-it-works">How it works <ArrowRight size={14} /></a></div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> A calmer way to send files</div>
          <h1>Good files.<br /><span>Safe travels.</span></h1>
          <p>Share the things that matter, without making a whole thing of it. One link, your rules.</p>
          <div className="hero-footnote"><LockKeyhole size={15} /> Your files stay yours. Choose who gets in.</div>
        </div>

        <section className="composer" aria-label="Create a file share">
          <div className="composer-heading"><div><span className="section-kicker">NEW TRANSFER</span><h2>Make a share link</h2></div><span className="step-count">01 <span>/ 01</span></span></div>

          <input ref={picker} className="visually-hidden" type="file" multiple onChange={(event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files)} aria-label="Choose files to share" />
          <div className={`dropzone ${dragging ? "dropzone-active" : ""} ${files.length ? "dropzone-filled" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
            {files.length === 0 ? <>
              <div className="upload-icon"><FolderUp size={22} strokeWidth={1.7} /></div>
              <strong>Drop your files here</strong>
              <span>or <button type="button" className="browse-link" onClick={() => picker.current?.click()}>browse to upload</button></span>
              <small>Any file type · Up to 2 GB per transfer</small>
            </> : <>
              <div className="file-list">
                {files.map((file, index) => {
                  const Icon = fileIcon(file.name);
                  return <div className="file-row" key={`${file.name}-${index}`}><span className="file-icon"><Icon size={17} /></span><span className="file-meta"><strong>{file.name}</strong><small>{file.size} · Ready to share</small></span><button aria-label={`Remove ${file.name}`} type="button" className="remove-file" onClick={() => { setFiles((current) => current.filter((_, i) => i !== index)); setShareUrl(""); }}><X size={16} /></button></div>;
                })}
              </div>
              <button className="add-more" type="button" onClick={() => picker.current?.click()}><Upload size={14} /> Add more files</button>
            </>}
          </div>

          <div className="options-block">
            <div className="option-head"><div className="option-title"><span className="option-icon"><LockKeyhole size={16} /></span><div><strong>Password protection</strong><small>Only people with the password can open this link</small></div></div><button role="switch" aria-checked={passwordEnabled} aria-label="Password protection" className={`switch ${passwordEnabled ? "switch-on" : ""}`} type="button" onClick={() => { setPasswordEnabled(!passwordEnabled); setError(""); }}><span /></button></div>
            {passwordEnabled && <div className="password-wrap"><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Create a password" autoComplete="new-password" aria-label="Create a password" /><span className="password-hint">4+ characters</span></div>}
          </div>

          <div className="expiry-row"><div className="option-title"><span className="expiry-icon"><Sparkles size={16} /></span><div><strong>Link expires</strong><small>After this, the link stops working</small></div></div><label className="select-wrap"><span className="visually-hidden">Link expiry</span><select value={expiry} onChange={(event) => setExpiry(event.target.value)}><option>1 day</option><option>7 days</option><option>30 days</option><option>Never</option></select><ChevronDown size={14} /></label></div>

          {error && <p className="form-error" role="alert">{error}</p>}
          {shareUrl ? <div className="share-result" aria-live="polite"><div className="result-top"><span className="result-check"><Check size={14} /></span><span>Link is ready to share</span></div><div className="link-copy"><input aria-label="Share link" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} /><button type="button" onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy link"}</button></div><small>{passwordEnabled ? "Share your password separately for added privacy." : "Anyone with this link can access the files."}</small></div> : <button type="button" className="create-button" onClick={createShare} disabled={busy}>{busy ? <><span className="button-spinner" /> Creating your link…</> : <>Create share link <ArrowRight size={17} /></>}</button>}
          <div className="micro-trust"><ShieldCheck size={14} /> Encrypted in transit <span /> No account needed</div>
        </section>
      </section>

      <footer className="page-footer" id="how-it-works"><div className="footer-note"><span className="footer-line" />A little less attachment, a little more peace of mind.</div><div className="footer-steps"><span><b>01</b> Add files</span><i /> <span><b>02</b> Set your rules</span><i /> <span><b>03</b> Send the link</span></div></footer>
    </main>
  );
}
