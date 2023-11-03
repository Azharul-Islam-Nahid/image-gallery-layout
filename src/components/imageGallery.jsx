import { useState, useEffect } from "react";
import axios from "axios";
import ImageUpload from "../components/imageUpload";

const Image = ({ image, index, selectedImages, handleImageSelection, handleImageDragStart, handleImageDrop }) => {
    const isSelected = selectedImages.includes(image._id);

    const handleCheckboxChange = () => {
        handleImageSelection(image._id);
    };

    return (
        <div
            draggable="true"
            onDragStart={() => handleImageDragStart(image._id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleImageDrop(image._id)}
            style={{
                position: "relative",
                margin: "5px",
                cursor: "move",
                backgroundColor: "transparent",
                transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
                // Add a dark background color on hover
                if (!isSelected) {
                    e.target.style.backgroundColor = "#333";
                }
            }}
            onMouseLeave={(e) => {
                // Restore the background color on mouse leave
                if (!isSelected) {
                    e.target.style.backgroundColor = "transparent";
                }
            }}
        >
            <input type="checkbox" checked={isSelected} onChange={handleCheckboxChange} style={{ position: "absolute", top: "5px", right: "5px" }} />
            <img src={image?.image} alt="gallery" style={{ width: "100%" }} />
        </div>
    );
};

const ImageGallery = () => {
    const [apiData, setApiData] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [draggedImageId, setDraggedImageId] = useState(null);

    const fetchImageData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/allimages");
            setApiData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchImageData();
    }, []);

    const handleImageSelection = (imageId) => {
        if (selectedImages.includes(imageId)) {
            setSelectedImages(selectedImages.filter((id) => id !== imageId));
        } else {
            setSelectedImages([...selectedImages, imageId]);
        }
    };

    const handleImageDragStart = (imageId) => {
        setDraggedImageId(imageId);
    };

    const handleImageDrop = (imageId) => {
        if (draggedImageId && draggedImageId !== imageId) {
            const updatedData = [...apiData];
            const fromIndex = updatedData.findIndex((item) => item._id === draggedImageId);
            const toIndex = updatedData.findIndex((item) => item._id === imageId);

            if (fromIndex !== -1 && toIndex !== -1) {
                // Reorder the images
                const [movedImage] = updatedData.splice(fromIndex, 1);
                updatedData.splice(toIndex, 0, movedImage);
                setApiData(updatedData);
            }
        }
        setDraggedImageId(null);
    };

    const handleImageUpload = (event) => {
        event.preventDefault();

        const form = event.target;

        const productImage = form.product_img.files[0];

        const image = productImage;
        const formData = new FormData();
        formData.append('image', image);
        const url = `https://api.imgbb.com/1/upload?key=0fd253a0ab31ae997654689deba2da86`;

        fetch(url, {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.json())
            .then((imgData) => {
                console.log(imgData);
                if (imgData.success) {
                    const imageDetail = {
                        image: imgData?.data.url,
                        posted: new Date().toLocaleTimeString(),
                    };

                    fetch(`http://localhost:5000/addImage`, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify(imageDetail),
                    })
                        .then((res) => res.json())
                        .then((result) => {
                            console.log(result);
                            fetchImageData();
                        });
                }
            });
    };

    const handleDeleteSelectedImages = async () => {
        if (selectedImages.length === 0) {

            return;
        }

        // Send requests to delete the selected images
        const deletePromises = selectedImages.map(async (imageId) => {
            try {
                await axios.delete(`http://localhost:5000/image/${imageId}`);
            } catch (error) {
                console.error(`Error deleting image with ID ${imageId}: ${error}`);
            }
        });

        // Wait for all delete operations to complete
        await Promise.all(deletePromises);

        // Clear the selected images
        setSelectedImages([]);

        // Fetch the updated image data
        fetchImageData();
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
                <div className="font-bold">{selectedImages?.length} files selected</div>
                <div>
                    {selectedImages.length > 0 && (
                        <button className="bg-white text-red-600 font-bold" onClick={handleDeleteSelectedImages}>
                            Delete Files
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-4">
                {apiData.map((item) => (
                    <Image
                        key={item._id}
                        image={item}
                        selectedImages={selectedImages}
                        handleImageSelection={handleImageSelection}
                        handleImageDragStart={handleImageDragStart}
                        handleImageDrop={handleImageDrop}
                    />
                ))}
                <div>
                    <ImageUpload handleImageUpload={handleImageUpload} />
                </div>
            </div>
        </div>
    );
};

export default ImageGallery;
