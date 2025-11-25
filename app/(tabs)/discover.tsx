import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import Polaroid from "../../components/polaroid";
import { auth, db } from "../../firebaseConfig";
import { globalStyles } from "../globalStyles";

// each firestore document in "polaroids" should have these fields:
// interface usage: every object "polaroidItem" should have following characteristics
interface PolaroidItem {
  id: string;
  actor: string;        // e.g., "Kim Rihyun"
  title: string;         // e.g., "Rimbaud"
  imageUrl: string;     // web URL or base64
  description: string;  // caption text
  filter: "none" | "blur" | "watermark";
  ownerId: string;
}

export default function HomeScreen() {
  const router = useRouter();
  //polaroids array will be consisted of PolaroidItem objects
  //which means array polaroids handle polaroids from firestore
  const [polaroids, setPolaroids] = useState<PolaroidItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); //track current polaroid
  const swiperRef = useRef<any>(null); // to keep data of swiper reference

  const handleLikePress = async () => {
    const card = polaroids[currentIndex];
      if (!card) return;

      await saveLike(card);
      swiperRef.current?.swipeRight(); //activate swipe animation
    };

  const saveBookmark = async (item: PolaroidItem) => {
    if (!auth.currentUser) return;
      
    await addDoc(collection(db, "bookmarks"), {
      userId: auth.currentUser.uid,
      polaroidId: item.id,
      createdAt: Date.now(),
        });

      console.log("Bookmarked:", item.id);
    }; 
  
  const handleBookmarkPress = async () => {
    const card = polaroids[currentIndex];
    if (!card) return;

    await saveBookmark(card);

    swiperRef.current?.swipeRight();
  }

  const saveLike = async (item: PolaroidItem) => {
      if (!auth.currentUser) return;

      await addDoc(collection(db, "likes"), {
        userId: auth.currentUser.uid,
        polaroidId: item.id,
        createdAt: Date.now(),
      });
      console.log("Liked:", item.id);
    };
    
  useEffect(() => {
    const fetchPolaroids = async () => {
      try {
        //bring out only polaroids of others (dont display mine to my feed)
        const q = query(
          collection(db, "polaroids"),
          where("ownerId", "!=", auth.currentUser?.uid));
        const snapshot = await getDocs(q); //get only documents(database entries) that fit the query
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<PolaroidItem, "id">), //pairing documents from firestore as a object of polaroid item
        }));
        setPolaroids(data); //putting the polaroidItem objects(data) into the polaroids array

        // log check: whether polaroid is loaded perfectly from the database
        console.log("✅ Loaded polaroids:", data.length);
      } catch (error) {
        console.error("❌ Error fetching polaroids:", error);
      }
    };
    fetchPolaroids();
  }, []);

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <Stack.Screen
        options={{
          title: "Discover",
          headerRight: () => (
            <TouchableOpacity
              style={globalStyles.uploadBtn}
              onPress={() => router.push("/addPolaroid")}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              
            </TouchableOpacity>
          )
        }}
      />

      {/* Swiper */}
      <View style={globalStyles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={polaroids}
          cardIndex={currentIndex}
          //activate onSwipe for current Index and change currentIndex to next card
          //change index: to allow the call of onSwiped for next cards
          onSwiped={(i) => setCurrentIndex(i+1)}
          renderCard={(card) =>
			      card ? ( //if card is true (is rendered)
            <View style={globalStyles.cardWrapper}>
            <Polaroid
              image={{ uri: card.imageUrl }}
              name={card.actor}
              desc={`${card.title}\n${card.description}`}
              filter={card.filter}
            />
            </View>
			) : null //card is not rendered, display white blank screen
			}
          backgroundColor="#f8f8f8"
          animateCardOpacity
          verticalSwipe={false}
          onSwipedLeft={(index) =>
            console.log("Swiped left on", polaroids[index]?.actor)
          }
          onSwipedRight={(index) =>{
            const card = polaroids[index];
            if (card) saveLike(card);
          }}
        />
      </View>

      {/* Polaroid Swiper Buttons */}
      <View style={globalStyles.buttonRow}>
        <TouchableOpacity
          style={[globalStyles.circleBtn, { backgroundColor: "#FF7F7F" }]}
          onPress={handleLikePress}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.circleBtn, { backgroundColor: "#B48CF0" }]}
          onPress={handleBookmarkPress}
        >
          <Ionicons name="star" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.circleBtn, { backgroundColor: "#FF6B6B" }]}
          onPress={handleLikePress}
        >
          <Ionicons name="heart" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}