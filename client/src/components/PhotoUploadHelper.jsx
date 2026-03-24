import { useState } from 'react';

export default function PhotoUploadHelper({ onPhotosSelected, maxPhotos = 5 }) {
  const [photos, setPhotos]     = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Reduce quality if image is too large
          if (width > 1200 || height > 1200) {
            const ratio = Math.min(1200 / width, 1200 / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };
      };
    });
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);

    if (photos.length + files.length > maxPhotos) {
      setError(`You can only add up to ${maxPhotos} photos.`);
      return;
    }

    try {
      setUploading(true);
      const compressedFiles = await Promise.all(
        files.map(file => {
          if (file.size > 5 * 1024 * 1024) { // 5MB
            return compressImage(file);
          }
          return Promise.resolve(file);
        })
      );

      const newPreviews = compressedFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              src: e.target.result,
              file: file,
              size: (file.size / 1024).toFixed(2)
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const resolved = await Promise.all(newPreviews);
      const updatedPhotos = [...photos, ...compressedFiles];
      const updatedPreviews = [...previews, ...resolved];

      setPhotos(updatedPhotos);
      setPreviews(updatedPreviews);
      onPhotosSelected?.(updatedPhotos, updatedPreviews);
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Error processing images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoRemove = (id) => {
    const newPreviews = previews.filter(p => p.id !== id);
    const newPhotos = photos.filter((_, idx) => previews[idx].id !== id);

    setPhotos(newPhotos);
    setPreviews(newPreviews);
    onPhotosSelected?.(newPhotos, newPreviews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) handlePhotoSelect({ target: { files } });
  };

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

      {/* Drop Zone */}
      <div
        className="photo-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ opacity: photos.length >= maxPhotos ? 0.5 : 1 }}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif"
          onChange={handlePhotoSelect}
          disabled={uploading || photos.length >= maxPhotos}
          style={{ display: 'none' }}
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          style={{ cursor: photos.length >= maxPhotos ? 'not-allowed' : 'pointer', display: 'block' }}
        >
          <div className="photo-drop-zone__icon">📸</div>
          <div className="photo-drop-zone__text">
            {uploading ? 'Processing...' : `Drag & drop or click to upload (${photos.length}/${maxPhotos})`}
          </div>
          <div className="photo-drop-zone__sub">JPEG, PNG, GIF · Max 5 MB each · Auto-compressed</div>
        </label>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="photo-grid">
          {previews.map(preview => (
            <div key={preview.id} className="photo-thumb">
              <img src={preview.src} alt="Preview" />
              <button
                type="button"
                className="photo-thumb__remove"
                onClick={() => handlePhotoRemove(preview.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div className="alert alert-success" style={{ marginTop: 10 }}>
          ✓ {photos.length} photo{photos.length !== 1 ? 's' : ''} ready to upload
        </div>
      )}
    </div>
  );
}