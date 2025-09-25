export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const html = `
    <div id="pdf-converter-app">
      <style>
        #pdf-converter-app {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          box-sizing: border-box;
        }

        #pdf-converter-app * {
          box-sizing: border-box;
        }

        #pdf-converter-app :root {
          --primary-color: #4e9641;
          --secondary-color: #17770e;
          --button-primary: #007cba;
          --button-secondary: #005f8d;
          --download-primary: #fd7e14;
          --download-secondary: #e83e8c;
        }

        .pdf-container {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .pdf-title {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
          font-size: 2.5em;
          font-weight: bold;
        }

        .pdf-upload-area {
          border: 3px dashed #4e9641;
          border-radius: 15px;
          padding: 40px;
          text-align: center;
          background: #f8f9ff;
          margin-bottom: 30px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .pdf-upload-area:hover {
          border-color: #17770e;
          background: #f0f1ff;
        }

        .pdf-upload-area.dragover {
          border-color: #17770e;
          background: #e6e8ff;
          transform: scale(1.02);
        }

        .pdf-upload-icon {
          font-size: 3em;
          color: #4e9641;
          margin-bottom: 15px;
        }

        .pdf-upload-text {
          font-size: 1.2em;
          color: #666;
          margin-bottom: 15px;
        }

        .pdf-file-input {
          display: none;
        }

        .pdf-upload-btn {
          background: linear-gradient(45deg, #4e9641, #17770e);
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 25px;
          font-size: 1.1em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pdf-upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .pdf-process-btn {
          background: linear-gradient(45deg, #007cba, #005f8d);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 1.2em;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
          margin: 20px auto;
          min-width: 200px;
        }

        .pdf-process-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .pdf-process-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .pdf-download-btn {
          background: linear-gradient(45deg, #fd7e14, #e83e8c);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 1.2em;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
          margin: 20px auto;
          min-width: 200px;
        }

        .pdf-download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .pdf-file-list {
          margin: 20px 0;
        }

        .pdf-file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 10px;
          background: #f8f9fa;
        }

        .pdf-file-name {
          font-weight: 500;
          color: #333;
          flex: 1;
          text-align: left;
        }

        .pdf-file-size {
          color: #666;
          font-size: 0.9em;
          margin: 0 10px;
        }

        .pdf-remove-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.8em;
        }

        .pdf-remove-btn:hover {
          background: #c82333;
        }

        .pdf-progress-container {
          margin: 20px 0;
        }

        .pdf-progress-bar {
          width: 100%;
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .pdf-progress-fill {
          height: 100%;
          background: linear-gradient(45deg, #28a745, #20c997);
          border-radius: 10px;
          width: 0%;
          transition: width 0.3s ease;
        }

        .pdf-progress-text {
          text-align: center;
          color: #666;
          font-weight: 500;
        }

        .pdf-results {
          margin-top: 30px;
        }

        .pdf-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .pdf-preview-item {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          background: #f8f9fa;
        }

        .pdf-preview-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin-bottom: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .pdf-preview-filename {
          font-weight: 500;
          color: #333;
          word-break: break-word;
        }

        .pdf-hidden {
          display: none;
        }

        .pdf-error {
          color: #dc3545;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
        }

        .pdf-settings {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .pdf-settings h3 {
          color: #333;
          margin-bottom: 15px;
        }

        .pdf-setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .pdf-setting-label {
          font-weight: 500;
          color: #555;
        }

        .pdf-setting-input {
          padding: 5px 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          width: 120px;
        }
      </style>

      <div class="pdf-container">
        <h1 class="pdf-title">Labans PDF till JPG Konverterare</h1>
        
        <div class="pdf-settings">
          <h3>Inställningar</h3>
          <div class="pdf-setting-row">
            <label class="pdf-setting-label" for="pdfQuality">JPG Kvalitet (0.1-1.0):</label>
            <input type="number" id="pdfQuality" class="pdf-setting-input" min="0.1" max="1.0" step="0.1" value="0.8">
          </div>
          <div class="pdf-setting-row">
            <label class="pdf-setting-label" for="pdfScale">Bildskala (1.0-3.0):</label>
            <input type="number" id="pdfScale" class="pdf-setting-input" min="1.0" max="3.0" step="0.1" value="2.0">
          </div>
        </div>

        <div class="pdf-upload-area" id="pdfUploadArea">
          <div class="pdf-upload-icon">📄</div>
          <div class="pdf-upload-text">Dra och släpp PDF-filer här eller klicka för att bläddra</div>
          <div style="color: #999; font-size: 0.9em; margin-top: 10px;">Stöder upp till 100 PDF-filer</div>
          <button type="button" class="pdf-upload-btn" style="margin-top: 15px;">Välj Filer</button>
          <input type="file" id="pdfFileInput" class="pdf-file-input" multiple accept=".pdf" max="100">
        </div>

        <div id="pdfFileList" class="pdf-file-list pdf-hidden"></div>

        <button id="pdfProcessBtn" class="pdf-process-btn pdf-hidden">
          Konvertera
        </button>

        <div id="pdfProgressContainer" class="pdf-progress-container pdf-hidden">
          <div class="pdf-progress-bar">
            <div id="pdfProgressFill" class="pdf-progress-fill"></div>
          </div>
          <div id="pdfProgressText" class="pdf-progress-text"></div>
        </div>

        <div id="pdfDownloadContainer" class="pdf-hidden">
          <button id="pdfDownloadZipBtn" class="pdf-download-btn">
            Ladda ner alla som ZIP
          </button>
          <div style="text-align: center; margin: 10px 0; color: #666;">eller ladda ner individuella filer nedan</div>
        </div>

        <div id="pdfResults" class="pdf-results pdf-hidden">
          <h3>Konverterade Bilder:</h3>
          <div id="pdfPreviewGrid" class="pdf-preview-grid"></div>
        </div>

        <div id="pdfErrorContainer"></div>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
      
      <script>
        (function() {
          // Initialize PDF.js with inline worker to avoid CORS issues
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          let selectedFiles = [];
          let convertedImages = [];

          // File upload handling
          const uploadArea = document.getElementById('pdfUploadArea');
          const fileInput = document.getElementById('pdfFileInput');
          const fileList = document.getElementById('pdfFileList');
          const processBtn = document.getElementById('pdfProcessBtn');

          // Setup event listeners
          uploadArea.addEventListener('click', () => fileInput.click());

          // Drag and drop functionality
          uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
          });

          uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
          });

          uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
            handleFiles(files);
          });

          fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            handleFiles(files);
          });

          processBtn.addEventListener('click', processPDFs);
          document.getElementById('pdfDownloadZipBtn').addEventListener('click', downloadAsZip);

          function handleFiles(files) {
            // Limit to 100 files
            const remainingSlots = 100 - selectedFiles.length;
            if (files.length > remainingSlots) {
              showError(\`Du kan bara ladda upp upp till 100 filer. Du har \${remainingSlots} platser kvar.\`);
              files = files.slice(0, remainingSlots);
            }

            // Filter only PDF files
            const pdfFiles = files.filter(file => file.type === 'application/pdf');
            
            if (pdfFiles.length !== files.length) {
              showError(\`\${files.length - pdfFiles.length} icke-PDF-filer ignorerades. Endast PDF-filer stöds.\`);
            }

            // Add new files to the list
            pdfFiles.forEach(file => {
              // Check for duplicates
              if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                selectedFiles.push(file);
              }
            });

            updateFileList();
            updateProcessButton();
          }

          function updateFileList() {
            if (selectedFiles.length === 0) {
              fileList.classList.add('pdf-hidden');
              return;
            }

            fileList.classList.remove('pdf-hidden');
            fileList.innerHTML = \`<h3>Valda Filer (\${selectedFiles.length}/100):</h3>\`;

            selectedFiles.forEach((file, index) => {
              const fileItem = document.createElement('div');
              fileItem.className = 'pdf-file-item';
              fileItem.innerHTML = \`
                <div class="pdf-file-name">\${file.name}</div>
                <div class="pdf-file-size">\${formatFileSize(file.size)}</div>
                <button class="pdf-remove-btn" onclick="window.pdfConverter.removeFile(\${index})">✕</button>
              \`;
              fileList.appendChild(fileItem);
            });
          }

          function removeFile(index) {
            selectedFiles.splice(index, 1);
            updateFileList();
            updateProcessButton();
          }

          function updateProcessButton() {
            if (selectedFiles.length > 0) {
              processBtn.classList.remove('pdf-hidden');
            } else {
              processBtn.classList.add('pdf-hidden');
            }
          }

          function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
          }

          function showError(message) {
            const errorContainer = document.getElementById('pdfErrorContainer');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'pdf-error';
            errorDiv.textContent = message;
            errorContainer.appendChild(errorDiv);
            
            // Remove error after 5 seconds
            setTimeout(() => {
              errorDiv.remove();
            }, 5000);
          }

          function updateProgress(current, total, fileName = '') {
            const progressContainer = document.getElementById('pdfProgressContainer');
            const progressFill = document.getElementById('pdfProgressFill');
            const progressText = document.getElementById('pdfProgressText');

            progressContainer.classList.remove('pdf-hidden');
            
            const percentage = (current / total) * 100;
            progressFill.style.width = percentage + '%';
            
            if (fileName) {
              progressText.textContent = \`\${current}/\${total}: \${fileName}\`;
            } else {
              progressText.textContent = \`\${current}/\${total} filer bearbetade (\${Math.round(percentage)}%)\`;
            }
          }

          function hideProgress() {
            document.getElementById('pdfProgressContainer').classList.add('pdf-hidden');
          }

          async function processPDFs() {
            if (selectedFiles.length === 0) {
              showError('Välj PDF-filer först.');
              return;
            }

            // Reset results
            convertedImages = [];
            document.getElementById('pdfResults').classList.add('pdf-hidden');
            document.getElementById('pdfDownloadContainer').classList.add('pdf-hidden');
            
            // Disable process button
            processBtn.disabled = true;
            processBtn.textContent = '🔄 Bearbetar...';

            const quality = parseFloat(document.getElementById('pdfQuality').value) || 0.8;
            const scale = parseFloat(document.getElementById('pdfScale').value) || 2.0;

            try {
              for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                updateProgress(i + 1, selectedFiles.length, file.name);

                try {
                  const jpgData = await convertPdfToJpg(file, quality, scale);
                  convertedImages.push({
                    originalName: file.name,
                    jpgName: file.name.replace('.pdf', '.jpg'),
                    jpgData: jpgData,
                    success: true
                  });
                } catch (error) {
                  console.error(\`Error processing \${file.name}:\`, error);
                  showError(\`Failed to process \${file.name}: \${error.message}\`);
                  convertedImages.push({
                    originalName: file.name,
                    jpgName: file.name.replace('.pdf', '.jpg'),
                    jpgData: null,
                    success: false,
                    error: error.message
                  });
                }
              }

              hideProgress();
              displayResults();
              
            } catch (error) {
              console.error('Processing error:', error);
              showError(\`Processing failed: \${error.message}\`);
            } finally {
              // Re-enable process button
              processBtn.disabled = false;
              processBtn.textContent = 'Konvertera';
            }
          }

          async function convertPdfToJpg(file, quality = 0.8, scale = 2.0) {
            return new Promise((resolve, reject) => {
              const fileReader = new FileReader();
              
              fileReader.onload = async function(event) {
                try {
                  const pdfData = new Uint8Array(event.target.result);
                  
                  // Load the PDF document
                  const pdf = await pdfjsLib.getDocument(pdfData).promise;
                  
                  // Get the first page
                  const page = await pdf.getPage(1);
                  
                  // Set up a canvas for rendering
                  const viewport = page.getViewport({ scale: scale });
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');
                  canvas.width = viewport.width;
                  canvas.height = viewport.height;
                  
                  // Render the PDF page into the canvas
                  await page.render({ canvasContext: context, viewport }).promise;
                  
                  // Convert canvas to JPG
                  const jpgData = canvas.toDataURL('image/jpeg', quality);
                  
                  resolve(jpgData);
                } catch (error) {
                  reject(error);
                }
              };
              
              fileReader.onerror = () => {
                reject(new Error('Failed to read PDF file'));
              };
              
              fileReader.readAsArrayBuffer(file);
            });
          }

          function displayResults() {
            const results = document.getElementById('pdfResults');
            const previewGrid = document.getElementById('pdfPreviewGrid');
            const downloadContainer = document.getElementById('pdfDownloadContainer');

            if (convertedImages.length === 0) {
              return;
            }

            results.classList.remove('pdf-hidden');
            previewGrid.innerHTML = '';

            const successfulConversions = convertedImages.filter(img => img.success);
            
            if (successfulConversions.length > 0) {
              downloadContainer.classList.remove('pdf-hidden');
            }

            convertedImages.forEach((image, index) => {
              const previewItem = document.createElement('div');
              previewItem.className = 'pdf-preview-item';

              if (image.success) {
                previewItem.innerHTML = \`
                  <img src="\${image.jpgData}" alt="\${image.jpgName}" class="pdf-preview-image">
                  <div class="pdf-preview-filename">\${image.jpgName}</div>
                  <div class="pdf-preview-filesize" style="color: #666; font-size: 0.9em; margin-top: 5px;">\${formatFileSize((image.jpgData.length * (3/4)) - 2)}</div>
                  <button onclick="window.pdfConverter.downloadSingleImage(\${index})" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Ladda ner
                  </button>
                \`;
              } else {
                previewItem.innerHTML = \`
                  <div style="color: #dc3545; padding: 20px;">
                    <div style="font-size: 2em;">❌</div>
                    <div class="pdf-preview-filename">\${image.originalName}</div>
                    <div style="font-size: 0.8em; margin-top: 5px;">Misslyckades: \${image.error || 'Okänt fel'}</div>
                  </div>
                \`;
              }

              previewGrid.appendChild(previewItem);
            });
          }

          function downloadSingleImage(index) {
            const image = convertedImages[index];
            if (!image.success || !image.jpgData) {
              showError('Bilddata är inte tillgänglig för nedladdning.');
              return;
            }

            const link = document.createElement('a');
            link.href = image.jpgData;
            link.download = image.jpgName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

          async function downloadAsZip() {
            const successfulImages = convertedImages.filter(img => img.success && img.jpgData);
            
            if (successfulImages.length === 0) {
              showError('Inga bilder tillgängliga för nedladdning.');
              return;
            }

            try {
              const zip = new JSZip();

              // Add each image to the zip
              successfulImages.forEach(image => {
                // Convert base64 to binary
                const base64Data = image.jpgData.split(',')[1];
                zip.file(image.jpgName, base64Data, { base64: true });
              });

              // Generate zip file
              updateProgress(0, 1, 'Skapar ZIP-fil...');
              const zipBlob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
              });
              hideProgress();

              // Download zip file
              const link = document.createElement('a');
              link.href = URL.createObjectURL(zipBlob);
              link.download = \`converted_pdfs_\${new Date().toISOString().split('T')[0]}.zip\`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Clean up
              URL.revokeObjectURL(link.href);

            } catch (error) {
              console.error('Error creating zip:', error);
              showError('Misslyckades med att skapa ZIP-fil.');
              hideProgress();
            }
          }

          // Expose functions to global scope for onclick handlers
          window.pdfConverter = {
            removeFile,
            downloadSingleImage
          };
        })();
      </script>
    </div>
  `;

  res.status(200).send(html);
}