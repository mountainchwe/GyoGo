import Polaroid from "@/components/polaroid";
import { Stack, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Swiper from "react-native-deck-swiper";
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
  const router = useRouter();

  useEffect(() => {
    const loadUploads = async () => {
      if (!auth.currentUser) return;

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
          headerStyle: {
            
          },
          headerTitleAlign:"center",
          headerShown: true,
        }}
      />
        <View style={globalStyles.swiperContainer}>
            <Swiper
            ref ={swiperRef}
            cards={uploads}
            renderCard={(card) =>
                card ? (
                    <View style={globalStyles.cardWrapper}>
                        <Polaroid
                        image={{ uri: card.imageUrl}}
                        name={card.actor}
                        desc={`${card.title}\n${card.description}`}
                        filter={card.filter}
                        />
                    </View>
                ) : null 
            }
            backgroundColor="#f8f8f8"
            animateCardOpacity
            verticalSwipe={false}
            />
        </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 8,
  },
  title: { fontWeight: "600", fontSize: 16 },
  actor: { color: "#555", marginBottom: 4 },
  desc: { color: "#666", fontSize: 14 },
});
