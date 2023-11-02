import { useState, useEffect } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ImageUpload from "./imageUpload";

const ItemType = "IMAGE";

const Image = ({ image, index, moveImage, selectedImages, handleImageSelection }) => {
    const [, ref] = useDrag({
        type: ItemType,
        item: { index },
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (draggedImage) => {
            if (draggedImage.index !== index) {
                moveImage(draggedImage.index, index);
                draggedImage.index = index;
            }
        },
    });

    const isSelected = selectedImages.includes(image._id);

    const handleCheckboxChange = () => {
        handleImageSelection(image._id);
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            ref={(node) => ref(drop(node))}
            style={{
                position: "relative",
                margin: "5px",
                cursor: "move",
                backgroundColor: isHovered ? "#333" : "transparent",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <input type="checkbox" checked={isSelected} onChange={handleCheckboxChange} style={{ position: "absolute", top: "5px", right: "5px" }} />
            <img src={image?.image} alt="gallery" style={{ width: "100%" }} />
        </div>
    );
};

const ImageGallery = () => {
    const [apiData, setApiData] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    const fetchImageData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/allimages');
            setApiData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchImageData();
    }, []);

    const moveImage = (from, to) => {
        const updatedData = [...apiData];
        const [movedImage] = updatedData.splice(from, 1);
        updatedData.splice(to, 0, movedImage);
        setApiData(updatedData);
    };

    const handleImageSelection = (imageId) => {
        if (selectedImages.includes(imageId)) {
            setSelectedImages(selectedImages.filter((id) => id !== imageId));
        } else {
            setSelectedImages([...selectedImages, imageId]);
        }
    };

    const handleDeleteSelectedImages = async () => {
        if (selectedImages.length === 0) {
            // No images selected, do nothing
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

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
                    <div className="font-bold">

                        {selectedImages?.length} file selected
                    </div>
                    <div>
                        {selectedImages.length > 0 && (
                            <button className="bg-white text-red-600 font-bold" onClick={handleDeleteSelectedImages}>
                                Delete Files
                            </button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-4">
                    {apiData.map((item, index) => (
                        <Image
                            key={item?._id}
                            image={item}
                            index={index}
                            moveImage={moveImage}
                            selectedImages={selectedImages}
                            handleImageSelection={handleImageSelection}
                        />
                    ))}
                    <div>
                        <ImageUpload handleImageUpload={handleImageUpload} />
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default ImageGallery;
