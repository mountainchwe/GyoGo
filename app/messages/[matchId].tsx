import { useLocalSearchParams } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { auth, db } from "../../firebaseConfig";

interface MatchData {
  userAid: string;
  userBid: string;
  userAmatchingPolaroids: string[];
  userBmatchingPolaroids: string[];
  createdAt: number;
}

interface PolaroidData {
  id: string;
  imageUrl: string;
  actor: string;
  title: string;
  description: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
  read: boolean;
}

export default function MessageRoom() {
  const { matchId } = useLocalSearchParams();
  const uid = auth.currentUser?.uid;

  const [match, setMatch] = useState<MatchData | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [myPola, setMyPola] = useState<PolaroidData | null>(null);
  const [theirPola, setTheirPola] = useState<PolaroidData | null>(null);

  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // NEW: Fullscreen preview
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // -------------------------------------------------------
  // Load match + polaroids + username
  // -------------------------------------------------------
  useEffect(() => {
    if (!matchId || !uid) return;

    const loadEverything = async () => {
      const snap = await getDoc(doc(db, "matches", String(matchId)));
      if (!snap.exists()) return;

      const data = snap.data() as MatchData;
      setMatch(data);

      const otherId = data.userAid === uid ? data.userBid : data.userAid;
      const uSnap = await getDoc(doc(db, "users", otherId));
      setOtherUser(uSnap.data());

      const myPolaId =
        data.userAid === uid
          ? data.userAmatchingPolaroids?.[0]
          : data.userBmatchingPolaroids?.[0];

      const theirPolaId =
        data.userAid === uid
          ? data.userBmatchingPolaroids?.[0]
          : data.userAmatchingPolaroids?.[0];

      if (myPolaId) {
        const ps = await getDoc(doc(db, "polaroids", myPolaId));
        if (ps.exists()) setMyPola({ id: ps.id, ...(ps.data() as any) });
      }
      if (theirPolaId) {
        const ps = await getDoc(doc(db, "polaroids", theirPolaId));
        if (ps.exists()) setTheirPola({ id: ps.id, ...(ps.data() as any) });
      }
    };

    loadEverything();
  }, [matchId]);

  // -------------------------------------------------------
  // Real-time message listener
  // -------------------------------------------------------
  useEffect(() => {
    if (!matchId) return;

    const q = query(
      collection(db, "messages", String(matchId), "msgs"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));
      setMessages(arr);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
    });

    return unsub;
  }, [matchId]);

  const sendMessage = async () => {
    if (!text.trim() || !uid) return;

    await addDoc(collection(db, "messages", String(matchId), "msgs"), {
      senderId: uid,
      text: text,
      createdAt: Date.now(),
      read: false,
    });

    setText("");
  };

  // -------------------------------------------------------
  // Message bubble renderer
  // -------------------------------------------------------
  const renderMessage = ({ item }: { item: Message }) => {
    const mine = item.senderId === uid;

    return (
      <View
        style={[
          styles.msgBubble,
          mine ? styles.myMsg : styles.theirMsg
        ]}
      >
        <Text style={styles.msgText}>{item.text}</Text>
        {mine && (
          <Text style={styles.readReceipt}>{item.read ? "✓✓" : "✓"}</Text>
        )}
      </View>
    );
  };

  // -------------------------------------------------------
  // Banner with clickable polaroids
  // -------------------------------------------------------
  const Banner = () => (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>
        You and @{otherUser?.username} matched!
      </Text>

      <View style={styles.bannerImages}>
        {/* My Polaroid */}
        <TouchableOpacity
          style={styles.imgWrap}
          onPress={() => myPola && setSelectedImage(myPola.imageUrl)}
        >
          {myPola ? (
            <Image source={{ uri: myPola.imageUrl }} style={styles.bannerImg} />
          ) : (
            <Text style={styles.placeholder}>?</Text>
          )}
        </TouchableOpacity>

        {/* Their Polaroid */}
        <TouchableOpacity
          style={styles.imgWrap}
          onPress={() => theirPola && setSelectedImage(theirPola.imageUrl)}
        >
          {theirPola ? (
            <Image source={{ uri: theirPola.imageUrl }} style={styles.bannerImg} />
          ) : (
            <Text style={styles.placeholder}>?</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // -------------------------------------------------------
  // FULLSCREEN PREVIEW MODAL
  // -------------------------------------------------------
  const ImageModal = () => (
    <Modal visible={!!selectedImage} transparent animationType="fade">
      <Pressable style={styles.modalBg} onPress={() => setSelectedImage(null)}>
        <Image
          source={{ uri: selectedImage! }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Banner />
      <ImageModal />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 12, paddingBottom: 120, }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "white", fontWeight: "700" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// STYLES
// -------------------------------------------------------
const screen = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 12, // prevents touching device navbar
  },

  banner: {
    padding: 16,
    backgroundColor: "#FFF3F3",
    borderBottomWidth: 1,
    borderColor: "#FFB6B6",
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 10,
    textAlign: "center",
  },
  bannerImages: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
  },
  imgWrap: {
    width: 110,
    height: 110,
    borderRadius: 14,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    fontSize: 32,
    color: "#aaa",
    textAlign: "center",
    marginTop: 30,
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: screen.width * 0.9,
    height: screen.height * 0.8,
  },

  msgBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
    maxWidth: "75%",
  },
  myMsg: {
    backgroundColor: "#B48CF0",
    alignSelf: "flex-end",
  },
  theirMsg: {
    backgroundColor: "#EDEDED",
    alignSelf: "flex-start",
  },
  msgText: {
    fontSize: 14,
    color: "#000",
  },
  readReceipt: {
    fontSize: 10,
    marginTop: 3,
    color: "#fff",
    alignSelf: "flex-end",
  },

  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
  },
  sendBtn: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 8,
    marginLeft: 10,
  },
});
