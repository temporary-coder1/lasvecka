export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const html = `
    <!-- PDF.js Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <!-- JSZip for creating zip files -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

    <div class="container">
        <h1>Labans PDF till JPG Konverterare</h1>
        
        <div class="settings">
            <h3>Inställningar</h3>
            <p>GP använd standardinställningarna</p>
            <div class="setting-row">
                <label class="setting-label" for="quality">JPG Kvalitet (0.1-1.0):</label>
                <input type="number" id="quality" class="setting-input" min="0.1" max="1.0" step="0.1" value="0.6">
            </div>
            <div class="setting-row">
                <label class="setting-label" for="scale">Bildskala (0.5-3.0):</label>
                <input type="number" id="scale" class="setting-input" min="0.5" max="3.0" step="0.1" value="1.0">
            </div>
        </div>

        <div class="upload-area" onclick="document.getElementById('fileInput').click()">
            <div class="upload-icon">📄</div>
            <div class="upload-text">Dra och släpp PDF-filer här eller klicka för att bläddra</div>
            <div style="color: #999; font-size: 0.9em; margin-top: 10px;">Stöder upp till 100 PDF-filer</div>
            <button type="button" class="upload-btn" style="margin-top: 15px;">Välj Filer</button>
            <input type="file" id="fileInput" class="file-input" multiple accept=".pdf" max="100">
        </div>

        <div id="fileList" class="file-list hidden"></div>

        <button id="processBtn" class="process-btn hidden" onclick="processPDFs()">
            Konvertera
        </button>

        <div id="progressContainer" class="progress-container hidden">
            <div class="progress-bar">
                <div id="progressFill" class="progress-fill"></div>
            </div>
            <div id="progressText" class="progress-text"></div>
        </div>

        <div id="downloadContainer" class="hidden">
            <button id="downloadZipBtn" class="download-btn" onclick="downloadAsZip()">
                Ladda ner alla som ZIP
            </button>
            <div style="text-align: center; margin: 10px 0; color: #666;">eller ladda ner individuella filer nedan</div>
        </div>

        <div id="results" class="results hidden">
            <h3>Konverterade Bilder:</h3>
            <div id="previewGrid" class="preview-grid"></div>
        </div>

        <div id="errorContainer"></div>
    </div>

    <script>
        // Initialize PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        let selectedFiles = [];
        let convertedImages = [];

        // File upload handling
        const uploadArea = document.querySelector('.upload-area');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        const processBtn = document.getElementById('processBtn');

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

        function handleFiles(files) {
            // Limit to 100 files
            const remainingSlots = 100 - selectedFiles.length;
            if (files.length > remainingSlots) {
                showError('Du kan bara ladda upp upp till 100 filer. Du har ' + remainingSlots + ' platser kvar.');
                files = files.slice(0, remainingSlots);
            }

            // Filter only PDF files
            const pdfFiles = files.filter(file => file.type === 'application/pdf');
            
            if (pdfFiles.length !== files.length) {
                showError((files.length - pdfFiles.length) + ' icke-PDF-filer ignorerades. Endast PDF-filer stöds.');
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
                fileList.classList.add('hidden');
                return;
            }

            fileList.classList.remove('hidden');
            fileList.innerHTML = '<h3> Valda Filer (' + selectedFiles.length + '/100):</h3>';

            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = 
                    '<div class="file-name">' + file.name + '</div>' +
                    '<div class="file-size">' + formatFileSize(file.size) + '</div>' +
                    '<button class="remove-btn" onclick="removeFile(' + index + ')">✕</button>';
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
                processBtn.classList.remove('hidden');
            } else {
                processBtn.classList.add('hidden');
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
            const errorContainer = document.getElementById('errorContainer');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            errorContainer.appendChild(errorDiv);
            
            // Remove error after 5 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }

        function updateProgress(current, total, fileName = '') {
            const progressContainer = document.getElementById('progressContainer');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');

            progressContainer.classList.remove('hidden');
            
            const percentage = (current / total) * 100;
            progressFill.style.width = percentage + '%';
            
            if (fileName) {
                progressText.textContent = current + '/' + total + ': ' + fileName;
            } else {
                progressText.textContent = current + '/' + total + ' filer bearbetade (' + Math.round(percentage) + '%)';
            }
        }

        function hideProgress() {
            document.getElementById('progressContainer').classList.add('hidden');
        }

        async function processPDFs() {
            if (selectedFiles.length === 0) {
                showError('Välj PDF-filer först.');
                return;
            }

            // Reset results
            convertedImages = [];
            document.getElementById('results').classList.add('hidden');
            document.getElementById('downloadContainer').classList.add('hidden');
            
            // Disable process button
            processBtn.disabled = true;
            processBtn.textContent = '🔄 Bearbetar...';

            const quality = parseFloat(document.getElementById('quality').value) || 0.8;
            const scale = parseFloat(document.getElementById('scale').value) || 2.0;

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
                        console.error('Error processing ' + file.name + ':', error);
                        showError('Failed to process ' + file.name + ': ' + error.message);
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
                showError('Processing failed: ' + error.message);
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
            const results = document.getElementById('results');
            const previewGrid = document.getElementById('previewGrid');
            const downloadContainer = document.getElementById('downloadContainer');

            if (convertedImages.length === 0) {
                return;
            }

            results.classList.remove('hidden');
            previewGrid.innerHTML = '';

            const successfulConversions = convertedImages.filter(img => img.success);
            
            if (successfulConversions.length > 0) {
                downloadContainer.classList.remove('hidden');
            }

            convertedImages.forEach((image, index) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';

                if (image.success) {
                    previewItem.innerHTML = 
                        '<img src="' + image.jpgData + '" alt="' + image.jpgName + '" class="preview-image">' +
                        '<div class="preview-filename">' + image.jpgName + '</div>' +
                        '<div class="preview-filesize" style="color: #666; font-size: 0.9em; margin-top: 5px;">' + formatFileSize((image.jpgData.length * (3/4)) - 2) + '</div>' +
                        '<button onclick="downloadSingleImage(' + index + ')" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">' +
                        '    Ladda ner' +
                        '</button>';
                } else {
                    previewItem.innerHTML = 
                        '<div style="color: #dc3545; padding: 20px;">' +
                        '    <div style="font-size: 2em;">❌</div>' +
                        '    <div class="preview-filename">' + image.originalName + '</div>' +
                        '    <div style="font-size: 0.8em; margin-top: 5px;">Misslyckades: ' + (image.error || 'Okänt fel') + '</div>' +
                        '</div>';
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
                link.download = 'converted_pdfs_' + new Date().toISOString().split('T')[0] + '.zip';
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
    </script>
  `;

  res.status(200).send(html);
}