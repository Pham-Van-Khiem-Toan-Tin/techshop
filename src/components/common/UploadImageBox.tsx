import { useRef } from "react"
import { FiUpload } from "react-icons/fi";

const UploadImageBox = ({ value, onChange, error }) => {
    const inputRef = useRef(null);

    const openPicker = () => inputRef.current?.click();

    const handlePick = (e) => {
        const file = e.target.files?.[0] ?? null;
        onChange(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] ?? null;
        onChange(file);
    };

    const previewUrl = value ? URL.createObjectURL(value) : null;

    return (
        <div>
            <div className="d-flex align-items-center gap-3">
                {/* Drop area */}
                <button
                    type="button"
                    className="upload-drop position-relative"
                    onClick={openPicker}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="preview"
                            className="upload-preview"
                            onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                    ) : (
                        <FiUpload size={22} />
                    )}
                </button>

                <div className="d-flex flex-column">
                    <button
                        type="button"
                        className="btn-sm w-fit btn-app btn-app--ghost"
                        onClick={openPicker}
                    >
                        Chọn ảnh từ thiết bị
                    </button>

                    <small className="text-muted mt-1">
                        Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.
                    </small>

                    {value && (
                        <small className="mt-1">
                            Đã chọn: <b>{value.name}</b>
                        </small>
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="d-none"
                    onChange={handlePick}
                />
            </div>

            {error && <div className="text-danger mt-2">{error}</div>}
        </div>
    );
}

export default UploadImageBox