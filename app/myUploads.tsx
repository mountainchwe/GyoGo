import Polaroid from "@/components/polaroid";
import { Stack } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../firebaseConfig";
import { globalStyles } from "./globalStyles";

interface PolaroidItem {
  id: string;
  actor: string;
  title: string;
  imageUrl: string;
  description: string;
  filter: "none" | "blur" | "watermark";
  ownerId: string;
}

export default function MyUploads() {
  const [uploads, setUploads] = useState<PolaroidItem[]>([]); //array filled with polaroidItems
  const swiperRef = useRef<any>(null);
  const [username, setUsername] = useState("username");

  const loadUser = async () => {
      const user = auth.currentUser;
      if(!user) return;

      const docRef = doc(db, "users", user.uid); // getting the document of the user based on userId
      const snap = await getDoc(docRef);

      if(snap.exists()) {
        setUsername(snap.data().username); // storing username into username array
      }

    };
  useEffect(() => {
    loadUser();
    const loadUploads = async () => {
      if (!auth.currentUser) return; //authorized user checking in case of reloading etc

      const q = query(
        collection(db, "polaroids"),
        where("ownerId", "==", auth.currentUser.uid) //gets the polaroids under user's id
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PolaroidItem, "id">), //set the firestore documents(polaroids) as polaroidItem
      }));

      setUploads(data); //put in uploads array
    };

    loadUploads();
  }, []);

  if (!auth.currentUser) {
    return (
      <View style={styles.center}>
        <Text>You need to be logged in.</Text>
      </View>
    );
  }

  return (

    <View style={globalStyles.container}>
        <Stack.Screen
        options={{
          title: "My Uploads",
          headerBackTitle:"Profile",
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: "600",
          },
          headerTitleAlign:"center",
          headerShown: true,
        }}
      />
        <FlatList
        data={uploads}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
          <View style={styles.scaleWrapper}>
            <Polaroid
              image={{uri: item.imageUrl}}
              name={item.actor}
              desc={`${item.title}\n${item.description}`}
              filter={item.filter}
              watermarkName={username}
              />  
          </View>
          </View>
        )}
        />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    justifyContent: "space-between",
  },
  scaleWrapper: {
    transform: [{scale: 0.55}],
  },
  gridItem: {
    width: "50%",
    alignItems: "center"
  },
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
});
