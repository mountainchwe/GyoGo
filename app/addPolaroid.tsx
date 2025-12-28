import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { Image, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebaseConfig";
import { globalStyles } from "./globalStyles";

export default function AddPolaroid() {
  const [image, setImage] = useState<string | null>(null); //string -> store base64 string instead of actual .jpg/.png file
  const [title, setTitle] = useState("");
  const [actors, setActors] = useState("");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState<"none" | "blur" | "watermark">("none"); //none as the default value

  // user picks image (local)
  const chooseImage = async () => {
	const result = await ImagePicker.launchImageLibraryAsync({ //launchImageLibraryAsync <- launch user's device Gallery
	  mediaTypes: ["images"],
	  quality: 0.4, //2mb images -> less than 1mb -> can store polaroid in firebase
	  base64: true, // to convert to base64
	});

	if (!result.canceled) {
	  const base64 = result.assets[0].base64;
	  setImage(`data:image/jpeg;base64,${base64}`); // lets user to preview the image on the app
	}
  };

  const handleUpload = async () => {
	if (!image) { //image (if true) should already be encoded into base64-encoding via  function chooseImage
	  alert("Please select an image!");
	  return;
	}

	await addDoc(collection(db, "polaroids"), {
	  imageUrl: image, // base64 string
	  title,
	  actor: actors,
	  description: desc,
	  filter,
	  ownerId: auth.currentUser?.uid ?? "anonymous",
	  createdAt: Date.now(),
	});

	alert("✅ Polaroid saved successfully!");
	setImage(null);
	setTitle("");
	setActors("");
	setDesc("");
  };

  return (
	<View style={globalStyles.uploadContainer}>

	  {/*Upload Image Button*/}
	  <TouchableOpacity onPress={chooseImage} style={globalStyles.imageBox}> 

		{/*check if image is True/False 
		True: Image is already chosen (base64 string is kept in variable image) -> Display image
		False: Image is not chosen -> Tap to choose Image */}

		{image ? 
		  <View style={globalStyles.imageContainer}>
			<Image
			source={{ uri: image}}
			style = {globalStyles.image}
			/>

			{/* BLUR FILTER */}
			{filter === "blur" && (
					  <View style={globalStyles.overlayContainer} pointerEvents="none">
						<BlurView
						  intensity={Platform.OS === "web" ? 40 : 100}
						  tint="light"
						  style={globalStyles.blurOverlay}
						/>
						{/* Extra blur overlays for mobile version */}
						{Platform.OS !== "web" && (
						<>
						  <View style={globalStyles.fogOverlay} />
						  <View style={globalStyles.frostedFogOverlay} />
						</>
					  )}
					  </View>
					)}

			{/* WATERMARK FILTER */}
			{filter === "watermark" && (
          <View style={globalStyles.watermarkContainer}>
				{Array.from({ length: 150 }).map((_, i) => ( //length need to be 150&above to cover most part of image
				<Text key={i} style={globalStyles.watermarkText}>
					username
				</Text>
			))}
		</View>
        )}
		  </View>
		   : (
		  <Text style={{ color: "#888" }}>Tap to choose image</Text> //False
		)}
	  </TouchableOpacity>

	  <View style={globalStyles.filterRow}>
		{["none", "blur", "watermark"].map((f) => (
		  <TouchableOpacity 
			key={f}
			style={[
			  globalStyles.filterButton,
			  filter === f && globalStyles.filterButtonActive
			]}
			onPress={() => setFilter(f as any)} //onpress on any of the filter buttons, 
												// setFilter updates the filter
												// -> re-renders and update the preview Image
		  >
			<Text style={[
			  globalStyles.filterText,
			  filter === f && globalStyles.filterTextActive //filter that is chosen
			]}>
			  {f}
			</Text>
		  </TouchableOpacity>
		))}
	  </View>


	  <TextInput
		placeholder="Show Title"
		style={globalStyles.input}
		value={title}
		onChangeText={setTitle}
	  />
	  <TextInput
		placeholder="Actors (comma to separate)"
		style={globalStyles.input}
		value={actors}
		onChangeText={setActors}
	  />
	  <TextInput
		placeholder="Description"
		style={[globalStyles.input, { height: 80 }]}
		multiline
		value={desc}
		onChangeText={setDesc}
	  />


	  <TouchableOpacity onPress={handleUpload} style={globalStyles.submitBtn}>
		<Text style={{ color: "white", fontWeight: "600" }}>Upload</Text>
	  </TouchableOpacity>
	</View>
  );
}