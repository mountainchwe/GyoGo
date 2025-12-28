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

export default function MyRejects() {
    const [rejects, setRejects] = useState<PolaroidItem[]>([]);

    const loadRejects = async () => {
            if (!auth.currentUser) return;

            // <----------- TAKING USER-REJECTED POLAROID ID
            const rjQuery = query(collection(db, "swipes"),
            where("userId", "==", auth.currentUser?.uid),
            where("type", "==", "reject"));
            const rjSnap = await getDocs(rjQuery);
            const rjId = rjSnap.docs.map((p) => (
              p.data().polaroidId
            ));

            let rjPola: PolaroidItem[] = [];

            for (let i = 0; i<rjId.length; i += 10){
              const batch = rjId.slice(i, i+10);

              const polaQuery = query(
                collection(db, "polaroids"),
                where(documentId(), "in", batch)
              );

              const polaSnap = await getDocs(polaQuery);
              polaSnap.docs.forEach(doc => {
                rjPola.push({
                  id: doc.id,
                  ...(doc.data() as Omit<PolaroidItem, "id">)
                });
              });
            }

            const ownerIds = [... new Set(rjPola.map(
              p => p.ownerId
            ))];

            const ownerMap: Record<string, string> = {};

            await Promise.all(ownerIds.map(async (uid) => {
            const snap = await getDoc(doc(db, "users", uid));
            ownerMap[uid] = snap.exists() ? snap.data().username : "unknown";
            }));

            const final = rjPola.map((p)=>({
              ...p,
              ownerUsername: ownerMap[p.ownerId],
            }))

            setRejects(final);
        };

      const handleReset = async () => {
        await resetSwipes("reject");   // wait for full deletion
        await loadRejects(); // reload page to show proof of reset
    }
    // useEffect contains coding for first run or value update
    useEffect(() => { // runs automatically everytime a component renders
      loadRejects();
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
          title: "Rejected Polaroids",
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
              ),
        }}
      />
        <FlatList
        data={rejects}
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
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
}

);