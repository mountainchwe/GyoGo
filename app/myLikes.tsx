import Polaroid from "@/components/polaroid";
import { resetSwipes } from "@/components/utils";
import { Stack } from "expo-router";
import { collection, doc, documentId, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  ownerUsername: string;
}

export default function MyLikes() {
    const [likes, setLikes] = useState<PolaroidItem[]>([]);

    const loadLikes = async () => {
            if (!auth.currentUser) return;

            // <----------- TAKING USER-LIKED POLAROID ID
            const likesQuery = query(collection(db, "swipes"),
            where("userId", "==", auth.currentUser?.uid),
            where("type", "==", "like"));
            const likeSnap = await getDocs(likesQuery);
            const likedIds = likeSnap.docs.map((p) => (
              p.data().polaroidId //get all liked polaroid ids
            ));

            let likedPola: PolaroidItem[] = [];

            for (let i = 0; i<likedIds.length; i += 10){
              const batch = likedIds.slice(i, i+10);

              const polaQuery = query(
                collection(db, "polaroids"),
                where(documentId(), "in", batch)
              );

              const polaSnap = await getDocs(polaQuery);
              polaSnap.docs.forEach(doc => {
                likedPola.push({
                  id: doc.id,
                  ...(doc.data() as Omit<PolaroidItem, "id">)
                });
              });
            }

            const ownerIds = [... new Set(likedPola.map(
              p => p.ownerId
            ))];

            const ownerMap: Record<string, string> = {};

            await Promise.all(ownerIds.map(async (uid) => {
            const snap = await getDoc(doc(db, "users", uid));
            ownerMap[uid] = snap.exists() ? snap.data().username : "unknown";
            }));

            const final = likedPola.map((p)=>({
              ...p,
              ownerUsername: ownerMap[p.ownerId],
            }))

            setLikes(final);
        };
    
        const handleReset = async () => {
          await resetSwipes("like");   // wait for full deletion
          await loadLikes(); // reload page to show proof of reset
    }
    //useEffect contains coding for first run or value update
    useEffect(() => {
        loadLikes();
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
          title: "My Likes",
          headerBackTitle:"Profile",
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: "600",
          },
          headerTitleAlign:"center",
          headerShown: true,
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={globalStyles.uploadBtn}
          onPress={handleReset}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Reset</Text>
        </TouchableOpacity>
      </View>
    ),}}
      />
        <FlatList
                data={likes}
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
                      watermarkName={item.ownerUsername}
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
}

);