import "./App.css";
import {
  ref,
  uploadBytes,
  getStorage,
  getDownloadURL,
} from "@firebase/storage";
import initializeFirebaseAuth from "./Firebase/firebase.initialize";
import { useEffect, useRef, useState } from "react";

initializeFirebaseAuth();

function App() {
  const [photo, setPhoto] = useState(null);
  const [reload, setReload] = useState(false);
  const imageRef = useRef(null);

  // Upload Photo
  const uploadPhoto = () => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${photo.name}`);
    setReload(false);
    imageRef.current.value = '';
    uploadBytes(storageRef, photo).then((snapshot) => {
      getDownloadURL(ref(storage, `images/${photo.name}`))
        .then((url) => {
          // Got URL and uploaded to firebase storage
          // Send it to mongoDB
          fetch("https://frozen-depths-11707.herokuapp.com/upload", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              url: url,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              setReload(true);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  // Handle Photo Input
  const handlePhoto = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
      console.log(e.target.files[0]);
    }
  };
  // Done

  // Get all the images link
  const [imagesData, setImagesData] = useState([]);
  useEffect(() => {
    fetch("https://frozen-depths-11707.herokuapp.com/images")
      .then((res) => res.json())
      .then((data) => setImagesData(data));
  }, [reload]);
  return (
    <div className="container mt-5">
      <div className="input-group mb-3 w-50 m-auto">
        <input
          type="file"
          className="form-control"
          id="inputGroupFile02"
          onBlur={handlePhoto}
          ref={imageRef}
        />
        <button onClick={uploadPhoto} className="btn btn-dark fw-1">
          Upload
        </button>
      </div>

      <div className="row row-cols-1 row-cols-md-3 mt-5 g-5 px-2">
        {imagesData.map((image) => (
          <div className="col" key={image._id}>
            <img src={image.url} alt="" className="w-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
