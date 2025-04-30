import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import './Markdown.css';

marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  langPrefix: 'language-',
  highlight: function (code, lang) {
    return code;
  }
});

function Markdown({ markdown, setMarkdown }) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('converted.pdf');
  const fileInputRef = useRef(null);

  const printableRef = useRef(null);

  useEffect(() => {
    const html = marked.parse(markdown);
    setPreviewHtml(html);
  }, [markdown]);

  const handleConvertToPDF = async () => {
    setLoading(true);
  
    const isDarkMode = document.body.classList.contains('dark-theme');
  
    const fullContentDiv = document.createElement('div');
    fullContentDiv.innerHTML = previewHtml;
  
    const container = document.createElement('div');
    container.style.width = '794px'; // A4 at 96 DPI
    container.style.position = 'relative';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.lineHeight = '1.8';
    container.style.boxSizing = 'border-box';
    container.style.padding = '40px';
    container.style.overflowWrap = 'break-word';
    container.style.wordBreak = 'break-word';
    container.style.color = isDarkMode ? '#ffffff' : '#000000';
    container.style.maxWidth = '100%';
    container.style.backgroundColor = isDarkMode ? '#121212' : '#ffffff';
    container.style.minHeight = '100vh';
    container.style.height = 'auto';
    container.style.fontSize = '14px';
  
    if (isDarkMode) {
      container.classList.add('pdf-dark-mode');
    }
  
    fullContentDiv.querySelectorAll('*').forEach((el) => {
      el.style.pageBreakInside = 'avoid';
      el.style.breakInside = 'avoid';
      el.style.wordBreak = 'break-word';
      el.style.boxSizing = 'border-box';
      el.style.display = 'block';
      if (isDarkMode) {
        el.style.backgroundColor = '#121212';
        el.style.color = '#ffffff';
      }
      el.style.zIndex = '1';
      el.style.position = 'relative';
    });
  
    const tables = fullContentDiv.querySelectorAll('table');
    tables.forEach((table) => {
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '20px';
    });
  
    const tableCells = fullContentDiv.querySelectorAll('th, td');
    tableCells.forEach((cell) => {
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.textAlign = 'left';
    });
  
    const tableHeaders = fullContentDiv.querySelectorAll('th');
    tableHeaders.forEach((header) => {
      header.style.backgroundColor = '#f2f2f2';
      header.style.fontWeight = 'bold';
    });
  
    container.appendChild(fullContentDiv);
    document.body.appendChild(container);
  
    const contentHeight = container.scrollHeight;
  
    const images = container.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(async (img) => {
        if (img.complete && img.naturalWidth !== 0) return;
  
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
  
        if (img.src && !img.src.startsWith('data:image')) {
          const base64Image = await fetch(img.src)
            .then((res) => res.blob())
            .then(
              (blob) =>
                new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.readAsDataURL(blob);
                })
            );
          img.src = base64Image;
        }
      })
    );
  
    await new Promise((r) => setTimeout(r, 100));
    const opt = {
      margin: [0, 0, 0, 0],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 794,
        windowHeight: contentHeight,
        logging: false,
      },
      jsPDF: {
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: ['img', 'p', 'div'],
        before: '.page-break',
      },
    };
  
    try {
      await html2pdf().set(opt).from(container).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF.');
    } finally {
      document.body.removeChild(container);
      setLoading(false);
    }
  };
  
  
  const handleFile = (file) => {
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
      setFileName(file.name.replace(/\.md$/, '.pdf'));
      const reader = new FileReader();
      reader.onload = (e) => setMarkdown(e.target.result);
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .md file');
    }
  };

  return (
    <div className="MarkdownEditor">
      <h1>Convert your Markdown to PDF</h1>

      <div
        className={`drag-drop-area${dragging ? ' dragging' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        <p>
          <i className="fas fa-cloud-upload-alt" style={{ marginRight: '10px' }} />
          Drag & Drop your <b>.md</b> file here or click to upload
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </div>

      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Write or paste your Markdown here"
        rows="10"
        cols="50"
      />
      <h2>Preview</h2>
      <div
        className="preview markdown-body"
        ref={printableRef}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      />

      <button
        onClick={handleConvertToPDF}
        disabled={loading}
        className="convert-btn"
      >
        <i className="fas fa-file-pdf" style={{ marginRight: '10px' }} />
        {loading ? 'Converting...' : 'Convert to PDF'}
      </button>
    </div>
  );
}

export default Markdown;
