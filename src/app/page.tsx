"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Archive, ArrowDownToLine, AudioLines, Check, ChevronRight, CloudUpload, Code2, FileImage, FileText, Folder, FolderPlus, Grid2X2, HardDrive, List, LockKeyhole, MoreHorizontal, Plus, Search, ShieldCheck, Upload, Video, X } from "lucide-react";

type FileEntry = { name: string; size: string; type: string; date: string };
type FolderEntry = { name: string; protected: boolean; password: string };

function prettySize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext ?? "")) return FileImage;
  if (["mp4", "mov", "avi", "mkv"].includes(ext ?? "")) return Video;
  if (["mp3", "wav", "ogg", "m4a"].includes(ext ?? "")) return AudioLines;
  if (["zip", "rar", "7z"].includes(ext ?? "")) return Archive;
  if (["js", "ts", "tsx", "jsx", "py", "html", "css"].includes(ext ?? "")) return Code2;
  return FileText;
}

export default function Home() {
  const picker = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [folderName, setFolderName] = useState("");
  const [protectFolder, setProtectFolder] = useState(false);
  const [folderPassword, setFolderPassword] = useState("");
  const [modal, setModal] = useState<"folder" | "upload" | null>(null);
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<FolderEntry | null>(null);
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    setError("");
    window.setTimeout(() => {
      const added = Array.from(list).map((file) => ({ name: file.name, size: prettySize(file.size), type: file.type, date: "Just now" }));
      setFiles((current) => [...added, ...current]);
      setBusy(false);
      setModal(null);
      setNotice(`${added.length} ${added.length === 1 ? "file" : "files"} uploaded`);
      window.setTimeout(() => setNotice(""), 3000);
    }, 500);
  }

  function createFolder(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!folderName.trim()) { setError("Enter a folder name."); return; }
    if (protectFolder && folderPassword.length < 4) { setError("Use a password with at least 4 characters."); return; }
    setFolders((current) => [...current, { name: folderName.trim(), protected: protectFolder, password: protectFolder ? folderPassword : "" }]);
    setFolderName(""); setFolderPassword(""); setProtectFolder(false); setError(""); setModal(null);
    setNotice("Folder created"); window.setTimeout(() => setNotice(""), 3000);
  }

  const visibleFiles = files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase()));
  const visibleFolders = folders.filter((folder) => folder.name.toLowerCase().includes(search.toLowerCase()));

  return <div className="manager-shell">
    <aside className="manager-sidebar">
      <a className="manager-brand" href="#home"><span className="manager-brand-icon"><CloudUpload size={20} /></span><span>File<span>Share</span></span></a>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation"><a className="side-link side-link-active" href="#files"><HardDrive size={17} /> My Files</a><a className="side-link" href="#shared"><ArrowDownToLine size={17} /> Shared with me</a></nav>
      <div className="sidebar-storage"><div className="storage-title"><span>Storage</span><span>Local demo</span></div><div className="storage-track"><span /></div><small>Files stay in this browser session</small></div>
      <div className="sidebar-bottom"><div className="avatar">K</div><div><strong>Guest workspace</strong><small>Personal files</small></div><MoreHorizontal size={17} className="sidebar-more" /></div>
    </aside>

    <main className="manager-main" id="home">
      <header className="manager-header"><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{activeFolder ?? "My Files"}</strong></div><div className="header-actions"><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files and folders" aria-label="Search files and folders" /><kbd>/</kbd></label><div className="header-avatar">K</div></div></header>

      <section className="files-content" id="files">
        <div className="page-heading"><div><p className="heading-eyebrow">YOUR SPACE</p><h1>{activeFolder ?? "My Files"}</h1><p className="page-subtitle">Upload, organize, and share your files.</p></div><div className="heading-actions"><button className="button-secondary" onClick={() => { setError(""); setModal("folder"); }}><FolderPlus size={16} /> New Folder</button><button className="button-primary" onClick={() => picker.current?.click()}><Plus size={17} /> Add File</button></div></div>
        <input ref={picker} type="file" multiple className="hidden-picker" onChange={(event) => addFiles(event.target.files)} aria-label="Choose files to upload" />
        <button className="upload-banner" onClick={() => setModal("upload")}><span className="upload-banner-icon"><CloudUpload size={22} /></span><span className="upload-banner-text"><strong>Upload files</strong><small>Drop files here or click to browse</small></span><span className="upload-banner-limit">Up to 100 MB per file</span><ChevronRight size={17} className="banner-chevron" /></button>

        <div className="list-toolbar"><div><h2>Folders and files</h2><span className="item-count">{visibleFolders.length + visibleFiles.length} items</span></div><div className="view-toggle" role="group" aria-label="View options"><button aria-label="Grid view" aria-pressed={layout === "grid"} className={layout === "grid" ? "view-selected" : ""} onClick={() => setLayout("grid")}><Grid2X2 size={16} /></button><button aria-label="List view" aria-pressed={layout === "list"} className={layout === "list" ? "view-selected" : ""} onClick={() => setLayout("list")}><List size={17} /></button></div></div>

        {notice && <div className="toast-note" role="status"><Check size={15} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={14} /></button></div>}
        {busy && <div className="upload-progress" role="status"><span className="progress-spinner" /> Uploading files…</div>}
        {visibleFolders.length + visibleFiles.length === 0 ? <div className="empty-state"><div className="empty-illustration"><div className="empty-cloud"><CloudUpload size={32} /></div><span className="empty-spark spark-a" /><span className="empty-spark spark-b" /><div className="empty-shadow" /></div><h3>{search ? "No results found" : "Your files, all in one place"}</h3><p>{search ? "Try a different search term." : "Upload a file or create a folder to get started."}</p><button className="button-primary" onClick={() => picker.current?.click()}><Upload size={16} /> Upload your first file</button></div> : <div className={`entry-grid ${layout === "list" ? "entry-list" : ""}`}>
          {visibleFolders.map((folder) => <button className="entry-card folder-card" key={folder.name} onClick={() => folder.protected ? setPasswordTarget(folder) : setActiveFolder(folder.name)}><div className="entry-preview folder-preview"><Folder size={34} fill="currentColor" strokeWidth={1.4} /><span className="folder-lock">{folder.protected && <LockKeyhole size={13} />}</span><MoreHorizontal size={17} className="entry-more" /></div><div className="entry-details"><strong>{folder.name}</strong><small>{folder.protected ? "Password protected" : "Folder"}</small></div></button>)}
          {visibleFiles.map((file, index) => { const Icon = iconFor(file.name); return <article className="entry-card" key={`${file.name}-${index}`}><div className="entry-preview file-preview"><Icon size={33} strokeWidth={1.5} /><button className="entry-more-button" aria-label={`More options for ${file.name}`} onClick={() => setNotice(`${file.name} is ready to download`)}><MoreHorizontal size={17} /></button></div><div className="entry-details"><strong title={file.name}>{file.name}</strong><small>{file.size} · {file.date}</small></div></article>; })}
        </div>}
      </section>
      <footer className="manager-footer"><span><ShieldCheck size={14} /> Private file workspace</span><span>FileShare</span></footer>
    </main>

    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setModal(null); setError(""); } }}><section className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={() => { setModal(null); setError(""); }} aria-label="Close"><X size={17} /></button>{modal === "folder" ? <><div className="modal-icon"><FolderPlus size={20} /></div><h2 id="modal-title">Create a folder</h2><p className="modal-description">Keep related files together. Add a password if you want to limit access.</p><form onSubmit={createFolder}><label className="modal-label" htmlFor="folder-name">Folder name</label><input id="folder-name" className="modal-input" autoFocus value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="e.g. Project files" /> <label className="protect-option"><span className="protect-copy"><LockKeyhole size={16} /><span><strong>Password protect</strong><small>Ask visitors for a password before opening</small></span></span><input type="checkbox" checked={protectFolder} onChange={(event) => setProtectFolder(event.target.checked)} /></label>{protectFolder && <><label className="modal-label" htmlFor="folder-password">Folder password</label><input id="folder-password" className="modal-input" type="password" autoComplete="new-password" value={folderPassword} onChange={(event) => setFolderPassword(event.target.value)} placeholder="At least 4 characters" /></>}{error && <p className="modal-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button-secondary" onClick={() => { setModal(null); setError(""); }}>Cancel</button><button type="submit" className="button-primary">Create Folder</button></div></form></> : <><div className="modal-icon"><CloudUpload size={20} /></div><h2 id="modal-title">Upload files</h2><p className="modal-description">Choose files from your device. Up to 100 MB per file.</p><button className="modal-drop" onClick={() => picker.current?.click()}><Upload size={20} /><strong>Drop files here or click to browse</strong><span>Any file type</span></button><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setModal(null)}>Cancel</button></div></>}</section></div>}

    {passwordTarget && <div className="modal-backdrop"><form className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="unlock-title" onSubmit={(event) => { event.preventDefault(); if (passwordAttempt === passwordTarget.password) { setActiveFolder(passwordTarget.name); setPasswordTarget(null); setPasswordAttempt(""); setError(""); } else setError("That password didn't match. Try again."); }}><button type="button" className="modal-close" onClick={() => { setPasswordTarget(null); setError(""); }} aria-label="Close"><X size={17} /></button><div className="modal-icon"><LockKeyhole size={19} /></div><h2 id="unlock-title">This folder is protected</h2><p className="modal-description">Enter the password to access <strong>{passwordTarget.name}</strong>.</p><label className="modal-label" htmlFor="unlock-password">Password</label><input id="unlock-password" className="modal-input" type="password" autoFocus value={passwordAttempt} onChange={(event) => setPasswordAttempt(event.target.value)} placeholder="Enter the password" />{error && <p className="modal-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setPasswordTarget(null)}>Cancel</button><button type="submit" className="button-primary">Open Folder</button></div></form></div>}
  </div>;
}
