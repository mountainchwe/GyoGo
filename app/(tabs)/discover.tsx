import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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
  ownerUsername: string
}

// export default functions do not need to be called
// react automatically calls the page's export default func when the corresponding page is active
export default function HomeScreen() {
  const router = useRouter();
  // polaroids array will be consisted of PolaroidItem objects
  // which means array polaroids handle polaroids from firestore
  const [polaroids, setPolaroids] = useState<PolaroidItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); //track current polaroid
  const swiperRef = useRef<any>(null); // to keep data of swiper reference

  // likeButton function
  const handleLikePress = async () => {
    const card = polaroids[currentIndex];
    if (!card) return;

    await saveLike(card);
    swiperRef.current?.swipeRight(); //activate swipe animation
    };
  
  // keep like record into database
  const saveLike = async (item: PolaroidItem) => {
    if (!auth.currentUser) return;

    // save Like into database
    await addDoc(collection(db, "swipes"), {
        userId: auth.currentUser.uid,
        polaroidId: item.id,
        createdAt: Date.now(),
        type: "like",
      });
    console.log("Liked:", item.id);

    // notify about the like
    await addDoc(collection(db, "notifications"), {
      toUserId: item.ownerId,              // receiver, user B
      fromUserId: auth.currentUser.uid,  // liker, user A
      polaroidId: item.id,
      type: "like",
      isRead: false,
      createdAt: Date.now(),
    });

    // match check: is there a match now after this like is made?
    const myPolaSnap = await getDocs(
      query(collection(db, "polaroids"), where("ownerId", "==", auth.currentUser.uid))
    );

    const myPolaroidIds = myPolaSnap.docs.map((doc) => doc.id);

    // Fetch ALL likes by B on A's polaroids
    const mutualSnap = await getDocs(
      query(
        collection(db, "swipes"),
        where("userId", "==", item.ownerId),
        where("type", "==", "like"),
        where("polaroidId", "in", myPolaroidIds)
      )
    );

    if (mutualSnap.empty) return; // no mutual likes → no match yet

    const userBmatchingPolaroids = mutualSnap.docs.map(
      (d) => d.data().polaroidId
    );

    // For consistency: A liked B’s ONE polaroid → that’s item.id
    const userAmatchingPolaroids = [item.id];

    // 4️⃣ Create match
    const matchRef = await addDoc(collection(db, "matches"), {
      userAid: auth.currentUser.uid,
      userBid: item.ownerId,
      userAmatchingPolaroids,
      userBmatchingPolaroids,
      createdAt: Date.now(),
    });

  // -----------------------------------------------------------
  // 5️⃣ Send MATCH notification to BOTH users
  // -----------------------------------------------------------
  await addDoc(collection(db, "notifications"), {
    toUserId: auth.currentUser.uid,
    fromUserId: item.ownerId,
    matchId: matchRef.id,
    type: "match",
    isRead: false,
    createdAt: Date.now(),
  });

  await addDoc(collection(db, "notifications"), {
    toUserId: item.ownerId,
    fromUserId: auth.currentUser.uid,
    matchId: matchRef.id,
    type: "match",
    isRead: false,
    createdAt: Date.now(),
  });
  };

  // keep bookmark record into database
  const saveBookmark = async (item: PolaroidItem) => {
    if (!auth.currentUser) return;

      await addDoc(collection(db, "swipes"), {
        userId: auth.currentUser.uid,
        polaroidId: item.id,
        createdAt: Date.now(),
        type: "bookmark",
      });
      console.log("Bookmarked:", item.id);
    };
  
  // bookmarkButton function
  const handleBookmarkPress = async () => {
    const card = polaroids[currentIndex];
    if (!card) return;

    await saveBookmark(card);

    swiperRef.current?.swipeBottom();
  }

  const handleRejectPress = async () => {
    const card = polaroids[currentIndex];
    if (!card) return;

    await saveReject(card);
    swiperRef.current?.swipeLeft();
  }

  const saveReject = async (item: PolaroidItem) => {
    if (!auth.currentUser) return;

      await addDoc(collection(db, "swipes"), {
        userId: auth.currentUser.uid,
        polaroidId: item.id,
        createdAt: Date.now(),
        type: "reject",
      });
      console.log("Rejected:", item.id);
    };


  const fetchPolaroids = async () => {
      try {
        // bring out only polaroids of others (dont display mine to my feed)
        // <---------- TAKING ALL POLAROIDS THAT'S NOT USERS' ---------->
        const q = query(
          collection(db, "polaroids"),
          where("ownerId", "!=", auth.currentUser?.uid));
        const snapshot = await getDocs(q); // get only documents(database entries) that fit the query
        const mineXPolaroids = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<PolaroidItem, "id">), // pairing documents from firestore as a object of polaroid item
        }));

        const ownerIds = [... new Set(mineXPolaroids.map(
          p => p.ownerId
        ))];

        //stores in <uid, username> form?
        const ownerMap: Record<string, string> = {};

        await Promise.all(ownerIds.map(async (uid) => {
        const snap = await getDoc(doc(db, "users", uid));
        ownerMap[uid] = snap.exists() ? snap.data().username : "unknown";
      }));

        // add ownerUsername to each PolaroidItem objects in mineXPolaroids
        const polaUsername = mineXPolaroids.map((p) => ({
          ...p,
          ownerUsername: ownerMap[p.ownerId], //ownerMap[p.ownerId] returns username
        }));

        // <---------- QUERY ALL SWIPED POLAROIDS ---------->
        const swipesQuery = query(
        collection(db, "swipes"),
        where("userId", "==", auth.currentUser?.uid)
        );

        const swipeSnap = await getDocs(swipesQuery);
        const swipePola = swipeSnap.docs.map(
          doc => doc.data().polaroidId // getting the swiped polaroids' ids
        );

        // <---------- GETTING THE WANTED DISPLAY: UNSWIPED POLAROIDS ---------->
        const finalFeed = polaUsername.filter(
          // .filter(conditionalVariable => condition)
          // .filter(id => id>1) ------> result: allPolaroids objects with id 2,3, ...
          p => !swipePola.includes(p.id) // p.id = currentpolaroidId
        );
        
        setPolaroids(finalFeed); // putting the polaroidItem objects(data) into the polaroids array

        // log check: whether polaroid is loaded perfectly from the database
        console.log("✅ Loaded polaroids:", finalFeed.length);
      } catch (error) {
        console.error("❌ Error fetching polaroids:", error);
      }
    };
    const refreshFeed = async () => {
      setCurrentIndex(0);   // reset swiper index
      await fetchPolaroids();  // re-load data from Firestore
    };

    useEffect(() => { // runs automatically everytime a component renders
      fetchPolaroids();
    }, []);

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <Stack.Screen
        options={{
          title: "Discover",
          headerRight: () => (
          <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
            <TouchableOpacity
              style={[globalStyles.uploadBtn, {marginRight: 15}]}
              onPress={refreshFeed}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={globalStyles.uploadBtn}
              onPress={() => router.push("/addPolaroid")}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              
            </TouchableOpacity>
      </View>
      )}}
      />

      {/* Swiper */}
      <View style={globalStyles.swiperContainer}>
        <Swiper
          key={polaroids.length}
          containerStyle={{ overflow: "visible" }}
          cardVerticalMargin={40}
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
              watermarkName={card.ownerUsername}
            />
            </View>
			) : null //card is not rendered, display white blank screen
			}
          backgroundColor="#f8f8f8"
          animateCardOpacity
          verticalSwipe={false}
          onSwipedLeft={(index) =>{
            const card = polaroids[index];
            if (card) saveReject(card);
          }}
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
          onPress={handleRejectPress}
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