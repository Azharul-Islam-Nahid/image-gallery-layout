import { useState } from 'react';

function ImageUpload({ handleImageUpload }) {
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageChange = (e) => {
        // Update the selected image when a file is chosen
        setSelectedImage(e.target.files[0]);
    };

    return (
        <div>
            <form onSubmit={handleImageUpload}>
                <div>
                    <label htmlFor="product_img" className="text-sm font-semibold">
                    </label>
                    <input
                        id="product_img"
                        type="file"
                        className="w-full p-3 rounded font-semibold text-slate-900 bg-white dark:bg-gray-50"
                        onChange={handleImageChange}
                        required
                    />
                </div>
                <button type="submit" className="bg-white text-black border border-black font-semibold hover:bg-cyan-300">
                    Upload Image
                </button>
            </form>

            {selectedImage && (
                <div>
                    <img width={250} src={URL.createObjectURL(selectedImage)} alt="Selected" />
                </div>
            )}
        </div>
    );
}

export default ImageUpload;
