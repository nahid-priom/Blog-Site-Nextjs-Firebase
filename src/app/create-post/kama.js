"use client";
import { useState, useEffect } from "react";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import "react-quill/dist/quill.snow.css";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const Page = () => {
  const [value, setValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [imageAlt, setImageAlt] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const router = useRouter();
  const createPost = async () => {
    // Use the Quill content from state
    let quillValue = value;

    const postsCollectionRef = collection(db, "BlogPosts");
    // Replace base64-encoded images with URLs
    quillValue = await replaceBase64Images(quillValue);

    // Remove <p> tags around images
    quillValue = quillValue
      .replace(/<p><img/g, "<img")
      .replace(/><\/p>/g, "/>");

    // Create a new BlogPost document
    await addDoc(collection(db, "BlogPosts"), {
      title: "My First Blog Post", // You can customize this
      authorId: auth.currentUser?.uid || "Unknown",
      contentData: quillValue,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.push("/");
    }, 3000);
  };

  const replaceBase64Images = async (quillValue) => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    const matches = quillValue.match(regex);

    if (!matches) {
      return quillValue;
    }

    const storage = getStorage();

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const imageUrl = match.replace(/<img[^>]+src="([^">]+)"/, "$1");

      if (imageUrl.startsWith("data:image")) {
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();

        // Generate a unique identifier for the image reference
        const uniqueIdentifier = Date.now(); // You can use any method to generate a unique identifier
        const imageRef = ref(
          storage,
          `images/temp_image_${uniqueIdentifier}_${i + 1}.png`
        );

        await uploadBytes(imageRef, imageBlob);

        // Replace base64-encoded image with the download URL
        quillValue = quillValue.replace(
          match,
          `<img src="${await getDownloadURL(imageRef)}" alt="${imageAlt}"`
        );
      }
    }

    return quillValue;
  };

  const handleImageClick = (imageUrl, altText) => {
    setSelectedImage({ imageUrl, altText });
    setImageAlt(altText || "");
    setSelectedImageUrl(imageUrl);
    setShowPopup(true);
  };

  const handleUpdateAlt = () => {
    if (selectedImage) {
      // Update the alt text of the selected image
      const updatedValue = value.replace(
        `<img src="${selectedImage.imageUrl}" alt="${imageAlt}" />`,
        `<img src="${selectedImage.imageUrl}" alt="${imageAlt}" />`
      );
      setValue(updatedValue);
    }

    setSelectedImage(null);
    setImageAlt("");
    setShowPopup(false);
    setSelectedImageUrl(""); // Reset the selected image URL
  };

  useEffect(() => {
    const quillEditor = document.querySelector(".ql-editor");

    if (quillEditor) {
      const handleEditorClick = (event) => {
        const isImage = event.target.tagName === "IMG";
        if (isImage) {
          handleImageClick(event.target.src, event.target.alt);
        }
      };

      quillEditor.addEventListener("click", handleEditorClick);

      // Remove the event listener when the component is unmounted
      return () => {
        quillEditor.removeEventListener("click", handleEditorClick);
      };
    }
  }, [handleImageClick]);

  return (
    <div className="flex relative max-w-[800px] mx-auto h-full flex-col justify-center items-center">
      <ReactQuill
        className="h-auto mt-16 rounded-full"
        theme="snow"
        value={value}
        onChange={(content, delta, source, editor) => {
          // Check if editor and editor.container are defined
          if (editor && editor.container) {
            // Attach a click event listener to images in the editor
            const images = editor.container.querySelectorAll("img");
            images.forEach((image) => {
              image.addEventListener("click", (event) => {
                handleImageClick(event.target.src, event.target.alt);
              });
            });

            // Don't forget to remove previous event listeners to avoid memory leaks
            return () => {
              images.forEach((image) => {
                image.removeEventListener("click", handleImageClick);
              });
            };
          }
        }}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, 4, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
          ],
          clipboard: {
            matchVisual: false,
          },
        }}
        formats={[
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "list",
          "bullet",
          "indent",
          "link",
          "image",
        ]}
        onMouseDown={(event) => {
          const isImage = event.target.tagName === "IMG";
          if (isImage) {
            handleImageClick(event.target.src, event.target.alt);
          }
        }}
      />
      <button
        onClick={createPost}
        className="w-20 mt-16 rounded flex justify-center bg-gray-600 text-white py-4 px-20 text-center text-base cursor-pointer"
      >
        Save
      </button>

      {showPopup && (
        <div className="bg-gray-200 rounded absolute h-20 flex justify-center items-center py-4 px-4">
          {/* Input for alt text */}
          <input
            type="text"
            placeholder="Enter alt text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className="py-1 px-2 rounded"
          />
          <div className="px-2">
            {/* Button to update alt text */}
            <button
              className="bg-black text-white px-1 py-1 rounded text-sm mr-2"
              onClick={handleUpdateAlt}
            >
              Update
            </button>
            {/* Close button */}
            <button
              className="bg-black text-white px-1 py-1 rounded text-sm "
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
